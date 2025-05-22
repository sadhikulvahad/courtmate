

import { useSelector } from 'react-redux'
import AdvocateDash from '../components/ui/advocate/Dashboard'; 

import { RootState } from '@/redux/store'
import Dashboard from '@/components/ui/admin/Layout';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const DashBoard = () => {
  const {isAuthenticated, user} = useSelector((state : RootState) => state.auth)
  const navigate = useNavigate()

  useEffect(() => {
    if(!isAuthenticated){
      navigate('/signup')
    }
  })
  
  return (
    <div>
      {user?.role === 'advocate' && (
        <AdvocateDash />
      )}
      {
        user?.role === 'admin' && (
          <Dashboard />
        )
      }
    </div>
  )
}

export default DashBoard
