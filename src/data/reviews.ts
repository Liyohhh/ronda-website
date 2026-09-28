// App reviews shown on the Home page.
// ONLY add real reviews, with the reviewer's permission (e.g. copied from the store listing or a
// signed-up beta tester). Never write sample or placeholder reviews here: while this list is
// empty the section shows a "be one of our first reviewers" message instead.

export type Review = {
  id: string
  name: string // as the reviewer agreed to be shown, e.g. "Aisyah R."
  rating: 1 | 2 | 3 | 4 | 5
  text: string // in the language it was written; not machine-translated
  lang: 'en' | 'ms' | 'zh' | 'ar'
  source: 'google-play' | 'app-store' | 'beta'
  date: string // YYYY-MM-DD
  verified?: boolean // rider verified through the app
}

export const REVIEWS: Review[] = []

// Where "Share feedback" goes until in-app reviews exist
export const FEEDBACK_HREF = '/help'
