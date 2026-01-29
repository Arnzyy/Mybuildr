import * as cheerio from 'cheerio'

interface ScrapedReview {
  reviewer_name: string
  rating: number
  review_text: string
  review_date: string
}

export async function scrapeCheckatradeReviews(
  checkatradeUrl: string,
  limit: number = 50
): Promise<ScrapedReview[]> {
  try {
    // Validate URL
    if (!checkatradeUrl.includes('checkatrade.com')) {
      throw new Error('Invalid Checkatrade URL')
    }

    // Ensure URL ends with /reviews
    let reviewsUrl = checkatradeUrl.replace(/\/+$/, '')
    if (!reviewsUrl.endsWith('/reviews')) {
      reviewsUrl += '/reviews'
    }

    // Try direct fetch first, fall back to proxy if blocked (403)
    let response = await fetch(reviewsUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8',
      },
    })

    // If blocked, try multiple CORS proxies as fallback
    if (!response.ok) {
      const proxies = [
        `https://api.allorigins.win/raw?url=${encodeURIComponent(reviewsUrl)}`,
        `https://corsproxy.io/?${encodeURIComponent(reviewsUrl)}`,
        `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(reviewsUrl)}`,
      ]
      for (const proxyUrl of proxies) {
        try {
          response = await fetch(proxyUrl)
          if (response.ok) break
        } catch {
          // Try next proxy
        }
      }
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch Checkatrade page (${response.status})`)
    }

    const html = await response.text()
    const $ = cheerio.load(html)

    const reviews: ScrapedReview[] = []

    // Try to extract from React streaming data (self.__next_f.push)
    // Checkatrade uses Next.js App Router with RSC streaming
    // The data uses escaped quotes like: "summary\":\"actual text\"
    // Normalize by removing backslash-escaped quotes so we can use simple regex
    const normalized = html.replace(/\\"/g, '"')

    const reviewMatches = normalized.matchAll(/"summary"\s*:\s*"((?:[^"\\]|\\.)*)"/g)
    const allSummaries = [...reviewMatches]

    if (allSummaries.length > 0) {
      for (const match of allSummaries) {
        if (reviews.length >= limit) break

        const text = match[1].replace(/\\n/g, '\n').trim()
        if (!text || text.length < 10) continue

        // Search nearby context (500 chars before and after) for related fields
        const start = Math.max(0, (match.index || 0) - 500)
        const end = Math.min(normalized.length, (match.index || 0) + match[0].length + 500)
        const context = normalized.substring(start, end)

        const nameMatch = context.match(/"displayName"\s*:\s*"((?:[^"\\]|\\.)*)"/)?.[1] || 'Customer'
        const ratingMatch = context.match(/"rating"\s*:\s*([\d.]+)/)?.[1]
        const dateMatch = context.match(/"createdAt"\s*:\s*"((?:[^"\\]|\\.)*)"/)?.[1]

        // Checkatrade uses /10, convert to /5
        let rating = 5
        if (ratingMatch) {
          const val = parseFloat(ratingMatch)
          rating = val > 5 ? Math.round(val / 2) : Math.round(val)
        }

        let date = new Date().toISOString().split('T')[0]
        if (dateMatch) {
          try {
            const parsed = new Date(dateMatch)
            if (!isNaN(parsed.getTime())) {
              date = parsed.toISOString().split('T')[0]
            }
          } catch { /* keep default */ }
        }

        reviews.push({
          reviewer_name: nameMatch.substring(0, 100),
          rating: Math.min(5, Math.max(1, rating)),
          review_text: text.substring(0, 1000),
          review_date: date,
        })
      }

      if (reviews.length > 0) return reviews
    }

    // Try __NEXT_DATA__ (older Next.js Pages Router)
    const nextDataScript = $('script#__NEXT_DATA__').html()
    if (nextDataScript) {
      try {
        const nextData = JSON.parse(nextDataScript)
        const pageProps = nextData?.props?.pageProps

        const reviewsData = findReviews(pageProps)
        if (reviewsData && reviewsData.length > 0) {
          for (const r of reviewsData.slice(0, limit)) {
            const review = extractReviewFromJson(r)
            if (review) reviews.push(review)
          }
          if (reviews.length > 0) return reviews
        }
      } catch {
        // Fall through to HTML parsing
      }
    }

    // Fallback: parse HTML directly
    // Try multiple possible selectors for Checkatrade's review elements
    const selectors = [
      '[data-testid="review-card"]',
      '.review-card',
      '.ch-review',
      '[class*="ReviewCard"]',
      '[class*="review-card"]',
      '[class*="Review_card"]',
      'article[class*="review"]',
    ]

    let reviewElements: ReturnType<cheerio.CheerioAPI> | null = null
    for (const selector of selectors) {
      const found = $(selector)
      if (found.length > 0) {
        reviewElements = found
        break
      }
    }

    if (reviewElements) {
      reviewElements.each((_, element) => {
        if (reviews.length >= limit) return false

        const $el = $(element)
        const review = extractReviewFromHtml($, $el)
        if (review) reviews.push(review)
      })
    }

    // If still no reviews, try finding any structured review-like content
    if (reviews.length === 0) {
      // Look for JSON-LD structured data
      $('script[type="application/ld+json"]').each((_, el) => {
        try {
          const jsonLd = JSON.parse($(el).html() || '')
          if (jsonLd['@type'] === 'LocalBusiness' || jsonLd['@type'] === 'Organization') {
            const jsonReviews = jsonLd.review || jsonLd.reviews || []
            for (const r of (Array.isArray(jsonReviews) ? jsonReviews : [jsonReviews]).slice(0, limit)) {
              if (r.reviewBody || r.description) {
                reviews.push({
                  reviewer_name: r.author?.name || r.author || 'Customer',
                  rating: Math.min(5, Math.max(1, Math.round(
                    r.reviewRating?.ratingValue || r.rating || 5
                  ))),
                  review_text: (r.reviewBody || r.description || '').substring(0, 1000),
                  review_date: r.datePublished || new Date().toISOString().split('T')[0],
                })
              }
            }
          }
        } catch {
          // Skip invalid JSON-LD
        }
      })
    }

    return reviews
  } catch (error) {
    console.error('Checkatrade scraping error:', error)
    throw error
  }
}

// Recursively search an object for an array that looks like reviews
function findReviews(obj: unknown): unknown[] | null {
  if (!obj || typeof obj !== 'object') return null

  if (Array.isArray(obj)) {
    // Check if this array contains review-like objects
    if (obj.length > 0 && typeof obj[0] === 'object' && obj[0] !== null) {
      const first = obj[0] as Record<string, unknown>
      if (
        'reviewText' in first || 'review_text' in first || 'text' in first ||
        'description' in first || 'body' in first || 'content' in first
      ) {
        return obj
      }
    }
    return null
  }

  for (const key of Object.keys(obj as Record<string, unknown>)) {
    if (key.toLowerCase().includes('review')) {
      const val = (obj as Record<string, unknown>)[key]
      if (Array.isArray(val) && val.length > 0) {
        return val
      }
    }
  }

  // Recurse into nested objects
  for (const val of Object.values(obj as Record<string, unknown>)) {
    const found = findReviews(val)
    if (found) return found
  }

  return null
}

// Extract review data from a JSON object (from __NEXT_DATA__)
function extractReviewFromJson(r: unknown): ScrapedReview | null {
  if (!r || typeof r !== 'object') return null
  const obj = r as Record<string, unknown>

  const text = String(
    obj.reviewText || obj.review_text || obj.text ||
    obj.description || obj.body || obj.content || ''
  ).trim()

  if (!text || text.length < 10) return null

  const name = String(
    obj.reviewerName || obj.reviewer_name || obj.customerName ||
    obj.customer_name || obj.author || obj.name || 'Customer'
  ).trim()

  let rating = 5
  const ratingVal = obj.rating || obj.score || obj.overallRating || obj.overall_rating
  if (typeof ratingVal === 'number') {
    // Checkatrade uses /10 rating, convert to /5
    rating = ratingVal > 5 ? Math.round(ratingVal / 2) : Math.round(ratingVal)
  }

  let date = new Date().toISOString().split('T')[0]
  const dateVal = obj.date || obj.review_date || obj.reviewDate || obj.createdAt || obj.created_at
  if (dateVal) {
    try {
      const parsed = new Date(String(dateVal))
      if (!isNaN(parsed.getTime())) {
        date = parsed.toISOString().split('T')[0]
      }
    } catch {
      // Keep default
    }
  }

  return {
    reviewer_name: name.substring(0, 100),
    rating: Math.min(5, Math.max(1, rating)),
    review_text: text.substring(0, 1000),
    review_date: date,
  }
}

// Extract review data from an HTML element
function extractReviewFromHtml(
  $: cheerio.CheerioAPI,
  $el: ReturnType<cheerio.CheerioAPI>
): ScrapedReview | null {
  // Name
  const name = $el.find(
    '.reviewer-name, [data-testid="reviewer-name"], [class*="author"], [class*="name"], strong'
  ).first().text().trim() || 'Customer'

  // Rating
  let rating = 5
  const ratingText = $el.find(
    '.rating, [data-testid="rating"], [class*="rating"], [class*="score"]'
  ).first().text()
  const ratingMatch = ratingText.match(/(\d+(?:\.\d+)?)/)?.[1]
  if (ratingMatch) {
    const val = parseFloat(ratingMatch)
    // Checkatrade uses /10, convert to /5
    rating = val > 5 ? Math.round(val / 2) : Math.round(val)
  }

  // Text
  const text = $el.find(
    '.review-text, [data-testid="review-text"], [class*="review-text"], [class*="ReviewText"], p'
  ).first().text().trim()

  if (!text || text.length < 10) return null

  // Date
  let date = new Date().toISOString().split('T')[0]
  const dateText = $el.find(
    '.review-date, [data-testid="review-date"], time, [class*="date"]'
  ).first().text().trim()
  if (dateText) {
    try {
      const parsed = new Date(dateText)
      if (!isNaN(parsed.getTime())) {
        date = parsed.toISOString().split('T')[0]
      }
    } catch {
      // Keep default
    }
  }

  return {
    reviewer_name: name.substring(0, 100),
    rating: Math.min(5, Math.max(1, rating)),
    review_text: text.substring(0, 1000),
    review_date: date,
  }
}
