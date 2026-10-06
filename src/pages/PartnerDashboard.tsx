import DashboardPage from '../components/DashboardPage'

// /partner-dashboard (merchant role): listings and ads are not built yet; this says so and links to what exists
function PartnerDashboard() {
  return (
    <DashboardPage
      title="dash_partnerTitle"
      intro="dash_partnerIntro"
      tiles={[
        { label: 'dash_listing', text: 'dash_listingText', icon: 'storefront' },
        { label: 'dash_ads', text: 'dash_adsText', icon: 'sell' },
        { label: 'dash_r300', text: 'dash_r300Text', icon: 'myLocation', to: '/ronda-300' },
        { label: 'dash_partnerHelp', text: 'dash_partnerHelpText', icon: 'helpOutline', to: '/help/general#business' },
      ]}
    />
  )
}

export default PartnerDashboard
