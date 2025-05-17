import image from '../assets/image.png' // relative import

function Navbar(){
    return (
        <div className="text-black flex justify-between font-bold px-10 py-4 border-b-1 border-[#E5E8EB]">
           <div className='flex gap-2 justify-center items-center'> 
                <img src={image} alt="Logo" className="h-6" />
                <p className="text-black">Moodsense</p> 
           </div>
    
           <button className="px-4 py-2 bg-[#F0F2F5] rounded-2x cursor-pointer hover:bg-[#E5E8EB]">Sign in</button>
        </div>
    )
} 
export default Navbar; 