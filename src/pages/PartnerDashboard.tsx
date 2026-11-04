import DashboardPage from '../components/DashboardPage'
import { RONDA300_MAP } from '../data/ronda300Link'

// /partner-dashboard (merchant role): listings and ads are not built yet; this says so and links to what exists
function PartnerDashboard() {
  return (
    <DashboardPage
      title="dash_partnerTitle"
      intro="dash_partnerIntro"
      tiles={[
        { label: 'dash_listing', text: 'dash_listingText', icon: 'storefront' },
        { label: 'dash_ads', text: 'dash_adsText', icon: 'sell' },
        { label: 'dash_r300', text: 'dash_r300Text', icon: 'myLocation', to: RONDA300_MAP },
        { label: 'dash_partnerHelp', text: 'dash_partnerHelpText', icon: 'helpOutline', to: '/help/general#business' },
      ]}
    />
  )
}

export default PartnerDashboard
