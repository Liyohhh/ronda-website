import DashboardPage from '../components/DashboardPage'

// /admin (admin role): data work is done in the database repo for now; this page links to the public checks
function Admin() {
  return (
    <DashboardPage
      title="dash_adminTitle"
      intro="dash_adminIntro"
      tiles={[
        { label: 'dash_live', text: 'dash_liveText', icon: 'train', to: '/live' },
        { label: 'dash_trails', text: 'dash_trailsText', icon: 'hiking', to: '/trails' },
        { label: 'dash_credits', text: 'dash_creditsText', icon: 'descriptionOutline', to: '/credits' },
        { label: 'dash_merchants', text: 'dash_merchantsText', icon: 'storefront' },
      ]}
    />
  )
}

export default Admin
