import DashboardPage from '../components/DashboardPage'
import ServiceAlertsAdmin from '../components/ServiceAlertsAdmin'

// /admin (admin role): links to the public checks, then the operator service alerts editor (other data work is done
// in the database repo for now)
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
    >
      <ServiceAlertsAdmin />
    </DashboardPage>
  )
}

export default Admin
