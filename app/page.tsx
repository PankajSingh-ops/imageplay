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
    <div onClick={()=>navigate.push("pages/filter")}>
      Filter
    </div>
    <div onClick={()=>navigate.push("pages/compress")}>
      Compress
    </div>
    <div onClick={()=>navigate.push("pages/sizer")}>
      Sizer
    </div>
    <div onClick={()=>navigate.push("pages/collage")}>
      Collage
    </div>
    <div onClick={()=>navigate.push("pages/rotator")}>
     Rotator
    </div>
    <div onClick={()=>navigate.push("pages/color")}>
     Color
    </div>
    <div onClick={()=>navigate.push("pages/grayscale")}>
     Grayscale
    </div>
    <div onClick={()=>navigate.push("pages/crop")}>
     Crop
    </div>
    <div onClick={()=>navigate.push("pages/jpgtopdf")}>
     JPG TO PDF
    </div>
    <div onClick={()=>navigate.push("pages/textextract")}>
     Text extract
    </div>
   </div>
  );
}
