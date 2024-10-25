"use client"
import ImagesearchRollerIcon from '@mui/icons-material/ImagesearchRoller';
import { useRouter } from 'next/navigation';
export default function Home() {
  const navigate=useRouter()
  return (
   <div>
    <div onClick={()=>navigate.push("pages/overlay")}>
      <ImagesearchRollerIcon />
    </div>
   </div>
  );
}
