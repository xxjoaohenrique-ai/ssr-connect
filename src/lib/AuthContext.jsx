import React, {createContext,useContext,useEffect,useState} from 'react';
import {ssr} from '@/api/ssrClient';
const Context=createContext(null);
export function AuthProvider({children}) {
  const [user,setUser]=useState(null);
  const [isLoadingAuth,setLoading]=useState(true);
  const checkUserAuth=async()=>{
    try {setUser(await ssr.auth.me());} catch {setUser(null);}
    finally {setLoading(false);}
  };
  useEffect(()=>{checkUserAuth();},[]);
  return <Context.Provider value={{user,isAuthenticated:!!user,isLoadingAuth,
    isLoadingPublicSettings:false,authError:null,appPublicSettings:null,
    authChecked:!isLoadingAuth,checkUserAuth,checkAppState:checkUserAuth,
    logout:ssr.auth.logout,navigateToLogin:ssr.auth.redirectToLogin}}>{children}</Context.Provider>;
}
export function useAuth(){const data=useContext(Context);if(!data) throw new Error('AuthProvider ausente');return data;}
