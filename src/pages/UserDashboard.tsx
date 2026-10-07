import DashboardPage from '../components/DashboardPage'

// /dashboard (signed in): the rider's page. Saved places and trips are not built yet.
function UserDashboard() {
  return (
    <DashboardPage
      title="dash_userTitle"
      intro="dash_userIntro"
      tiles={[
        { label: 'dash_plan', text: 'dash_planText', icon: 'route', to: '/#plan' },
        { label: 'dash_live', text: 'dash_liveText', icon: 'train', to: '/live' },
        { label: 'dash_r300', text: 'dash_r300Text', icon: 'myLocation', to: '/ronda-300' },
        { label: 'dash_saved', text: 'dash_savedText', icon: 'bookmark' },
        { label: 'dash_alerts', text: 'dash_alertsText', icon: 'notifications' },
        { label: 'dash_help', text: 'dash_helpText', icon: 'helpOutline', to: '/help' },
        { label: 'dash_account', text: 'dash_accountText', icon: 'personOutline', to: '/account' },
      ]}
    />
  )
}

export default UserDashboard
