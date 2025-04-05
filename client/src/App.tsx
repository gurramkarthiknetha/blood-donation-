import {createBrowserRouter,RouterProvider} from 'react-router-dom'
import RootLayout from './pages/rootLayout/RootLayout'
import Home from './pages/home/Home'
import Donor from './pages/donor/Donor'
import Reciever from './pages/reciever/Reciever'
import SiginPage from './pages/signinPage/SiginPage'
import './App.css'
import BloodCamp from './pages/bloodCamp/BloodCamp'

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
          element:<Reciever/>,
          path:'/reciever'
        },
        {
          element:<SiginPage/>,
          path:'/signinPage'
        },
        {
          element:<BloodCamp/>,
          path:'/bloodCamp'
        }
      ]
    }
  ])
  return (
    <RouterProvider router={browserRouterObj} />
  )
}

export default App