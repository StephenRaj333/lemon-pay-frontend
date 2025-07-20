import Header from '@/_components/header';
import Image from "next/image";
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Axios from 'axios';

export const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});    
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const router = useRouter();

  // Check for success message from signup
  useEffect(() => {
    if (router.query.message) {
      setSuccessMessage(router.query.message as string);
      // Clear the message from URL
      router.replace('/login', undefined, { shallow: true });
    }
  }, [router]);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {   
      const response = await Axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        email: formData.email,
        password: formData.password,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });   

      const { data } = response;

      if (response.status === 200) {
        // Store token based on rememberMe preference
        if (rememberMe) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
        } else {
          sessionStorage.setItem('token', data.token);
          sessionStorage.setItem('user', JSON.stringify(data.user));
        }

        // Redirect to dashboard
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
      
      if (Axios.isAxiosError(error)) {
        // API error with response
        if (error.response) {
          setErrors({ 
            submit: error.response.data.message || 'Login failed. Please try again.' 
          });
        } else if (error.request) {
          // Network error
          setErrors({ 
            submit: 'Network error. Please check your connection and try again.' 
          });
        } else {
          // Other axios error
          setErrors({ 
            submit: 'An unexpected error occurred. Please try again.' 
          });
        }
      } else {  
        // Non-axios error
        setErrors({ 
          submit: 'An unexpected error occurred. Please try again.' 
        });
      } 
    } finally {
      setIsLoading(false);  
    }
  };   
  return (  
    <>  
        <div className="signup-container min-h-[100vh] w-full relative pb-[60px] overflow-hidden"> 
            <Header /> 
            <div className="content flex justify-between items-center max-w-[90%] mx-auto max-[768px]:flex-col"> 
                <div className="left-sec w-[50%] max-[768px]:hidden">
                    <div className="text-content max-w-[646px]">
                        <h2 className='text-[48px] leading-[120%] text-[#FFF]'>Join 1000 Businesses <span className='text-[#DBD55B]'> Powering Growth with </span>  Lemonpay!</h2>
                    </div>
                </div>    
                <div className="right-sec w-[50%] max-[768px]:w-[100%]"> 
                    <div className="form-container max-w-[408px] mx-auto">  
                        <h4 className='text-[#FFF] text-[38px] leading-[120%] max-[768px]:text-[32px] font-semibold mb-[14px]'>Welcome Login System</h4>
                        <p className='text-[#FFF] text-[20px] leading-[30px] mb-[26px] font-normal'>Your gateway to seamless <br /> transactions and easy payments.</p>
                        <form onSubmit={handleSubmit} className="form-container">
                            {/* Success message */}
                            {successMessage && (
                                <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                                    {successMessage}
                                </div>
                            )}

                            {/* Error message */}
                            {errors.submit && (
                                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                                    {errors.submit}
                                </div>
                            )}

                            <div className="form-group mb-[14.7px] flex flex-col gap-[8px]">
                                <label className='text-[16px] leading-[18px] font-semibold tracking-[2%] text-[#FFF]' htmlFor="email">Email</label>
                                <input 
                                    type="email" 
                                    name='email' 
                                    id="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className={`bg-[#E6E1FAA3] border-1 ${errors.email ? 'border-red-500' : 'border-[#FFF]'} rounded-[4px] focus:outline-none px-[17.29px] py-[14.15px] text-[14px] leading-[20px] text-[#FFF] placeholder-[#FFF] placeholder-text-[12px] placeholder-leading-[2%]`}
                                    placeholder='mahadev@lemonpay.tech' 
                                    disabled={isLoading}
                                /> 
                                {errors.email && (
                                    <span className="text-red-300 text-sm">{errors.email}</span>
                                )}
                            </div>   
                            <div className="form-group mb-[8.35px] flex flex-col gap-[8px]">
                                <label className='text-[16px] leading-[18px] font-semibold tracking-[2%] text-[#FFF]' htmlFor="password">Password</label>
                                <input 
                                    type="password" 
                                    name='password' 
                                    id="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className={`bg-[#E6E1FAA3] border-1 ${errors.password ? 'border-red-500' : 'border-[#FFF]'} rounded-[4px] focus:outline-none px-[17.29px] py-[14.15px] text-[14px] leading-[20px] text-[#FFF] placeholder-[#FFF] placeholder-text-[12px] placeholder-leading-[2%]`}
                                    placeholder='Min 8 characters' 
                                    disabled={isLoading}
                                /> 
                                {errors.password && (
                                    <span className="text-red-300 text-sm">{errors.password}</span>
                                )}
                            </div>  
                            <div className="checkbox-signup flex justify-between items-center mb-[22px]">
                                <div className="checkbox flex items-center">
                                    <div className="relative flex items-flex-start">
                                        <input 
                                            type="checkbox" 
                                            name='remember' 
                                            id="remember"
                                            checked={rememberMe}
                                            onChange={(e) => setRememberMe(e.target.checked)}
                                            className='w-[16px] h-[16px] appearance-none border border-[#FFF] rounded-[4px] bg-transparent checked:bg-transparent checked:border-[#FFF] focus:outline-none cursor-pointer relative peer'
                                            disabled={isLoading}
                                        />  
                                        <svg    
                                            className="absolute top-[2px] left-[2px] w-[12px] h-[12px] text-[#FFF] pointer-events-none opacity-0 peer-checked:opacity-100" 
                                            fill="currentColor" 
                                            viewBox="0 0 20 20"
                                        >   
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>  
                                    </div>
                                    <label className='text-[#FFF] text-[14px] leading-[20px] font-normal tracking-[2%] ml-[8px] cursor-pointer' htmlFor="remember">Remember me</label>
                                </div>
                                <div className="forgot-password">
                                    <Link href={"/signup"} className='text-[#FFF] text-[14px] leading-[20px] font-bold tracking-[2%] hover:underline'>Sign Up</Link>    
                                </div>      
                            </div>   
                            <button 
                                type="submit"
                                disabled={isLoading}
                                className={`cursor-pointer w-full text-[#000] bg-[#FFF] text-[#183BA3] text-[14px] leading-[20px] font-bold py-[11px] rounded-[8px] max-[768px]:90px transition-opacity ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}
                            >
                                {isLoading ? 'Signing in...' : 'Sign in'}
                            </button>
                        </form>   
                    </div>      
                </div>  
            </div>  
            <div className="top-right absolute top-0 max-[768px]:top-[30%] right-0 max-[768px]: z-[-1] max-[768px]:hidden">  
                <Image className='max-w-[300px] w-[100%] h-[100%]' src={"/images/top-right-circle.png"} width={100} height={100} alt='circle' />    
            </div>  
            <div className="bottom-center absolute bottom-0  max-[768px]:bottom-[30%] left-[40%] z-[-1] w-[100%] max-[768px]:rotate-[270deg]">     
                <Image className='max-w-[300px] w-[100%] h-[100%]' src={"/images/bottom-center-circle.png"} width={100} height={100} alt='circle' />  
            </div>   
            <div className="bottom-left absolute bottom-0 left-[0] z-[-1]">  
                <Image className='max-w-[300px] max-[768px]:max-w-[450px] w-[100%] h-[100%]' src={"/images/bottom-left-circle.png"} width={100} height={100} alt='circle' />  
            </div>      
        </div>
    </>
  )
}

export default Login;