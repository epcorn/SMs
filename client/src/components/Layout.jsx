import { Outlet } from 'react-router-dom'
import Sidebar from './oth/Sidebar';
import { Toaster } from 'react-hot-toast';


function Layout() {
  return (
    <div className='h-dvh w-dvw overflow-hidden'>
      <Toaster position='top-center' />
      <Sidebar>
        <Outlet />
      </Sidebar>
    </div>
  )
}

export default Layout;