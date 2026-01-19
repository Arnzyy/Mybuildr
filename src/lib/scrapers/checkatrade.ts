import * as cheerio from 'cheerio'

interface ScrapedReview {
  reviewer_name: string
  rating: number
  review_text: string
  review_date: string
}

export async function scrapeCheckatradeReviews(
  checkatradeUrl: string,
  limit: number = 10
): Promise<ScrapedReview[]> {
  try {
    // Validate URL
    if (!checkatradeUrl.includes('checkatrade.com')) {
      throw new Error('Invalid Checkatrade URL')
    }

    // Fetch the page
    const response = await fetch(checkatradeUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch Checkatrade page')
    }

    const html = await response.text()
    const $ = cheerio.load(html)

    const reviews: ScrapedReview[] = []

    // Checkatrade review structure (may need updating if they change their HTML)
    $('.review-card, [data-testid="review-card"], .ch-review').each((_, element) => {
      if (reviews.length >= limit) return false

      const $el = $(element)

      // Extract reviewer name
      const name = $el.find('.reviewer-name, [data-testid="reviewer-name"], .ch-review__author').text().trim()
        || $el.find('strong').first().text().trim()
        || 'Anonymous'

      // Extract rating (look for stars or numeric rating)
      let rating = 5
      const ratingText = $el.find('.rating, [data-testid="rating"], .ch-review__rating').text()
      const ratingMatch = ratingText.match(/(\d+(?:\.\d+)?)/)?.[1]
      if (ratingMatch) {
        rating = Math.round(parseFloat(ratingMatch))
      }
      // Also check star count
      const stars = $el.find('.star-filled, .ch-star--filled, [data-filled="true"]').length
      if (stars > 0) {
        rating = stars
      }

      // Extract review text
      const text = $el.find('.review-text, [data-testid="review-text"], .ch-review__text, p').text().trim()

      // Extract date
      const dateText = $el.find('.review-date, [data-testid="review-date"], .ch-review__date, time').text().trim()
      let date = new Date().toISOString().split('T')[0]
      if (dateText) {
        try {
          const parsed = new Date(dateText)
          if (!isNaN(parsed.getTime())) {
            date = parsed.toISOString().split('T')[0]
          }
        } catch {
          // Keep default date
        }
      }

      if (text && text.length > 10) {
        reviews.push({
          reviewer_name: name.substring(0, 100),
          rating: Math.min(5, Math.max(1, rating)),
          review_text: text.substring(0, 1000),
          review_date: date,
        })
      }
    })

    return reviews
  } catch (error) {
    console.error('Checkatrade scraping error:', error)
    throw error
  }
}
