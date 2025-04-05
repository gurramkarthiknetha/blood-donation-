import {createBrowserRouter,RouterProvider} from 'react-router-dom'
import RootLayout from './pages/rootLayout/RootLayout'
import Home from './pages/home/Home'
import Donor from './pages/donor/Donor'
import Reciever from './pages/reciever/Reciever'
import SiginPage from './pages/signinPage/SigninPage'
import './App.css'
import BloodCamp from './pages/bloodCamp/BloodCamp'
import ReedemPage from './pages/reedemPage/ReedemPage'

function App() {
  const browserRouterObj= createBrowserRouter([
    {
      element:<RootLayout/>,
      path:'/',
      children:[
        {
          element:<Home/>,
          path:'/'
        },
        {
          element:<Donor/>,
          path:'/donor'
        },
        {
          element:<Reciever totalRequests={0} unitsReceived={0}/>,
          path:'/reciever'
        },
        {
          element:<SiginPage/>,
          path:'/signinPage'
        },
        {
          element:<BloodCamp/>,
          path:'/bloodCamp'
        },
        {
          element:<ReedemPage/>,
          path:'/reedemPage'
        }
      ]
    }
  ])
  return (
    <RouterProvider router={browserRouterObj} />
  )
}

export default App