import React from 'react'
import Hero from '@/components/home/Hero'
import Stats from '@/components/home/Stats'
import Footer from '@/components/layout/Footer'
import Navbar from '@/components/layout/Navbar'
import Features from '@/components/home/Features'

const page = () => {
  return (
    <>
    <Navbar />
   
    <main className="flex min-h-screen flex-col">
      <Hero />
      <Features />
      <Stats />
    </main>
    <Footer />
    </>
  )
}

export default page