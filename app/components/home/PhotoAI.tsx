import { Button } from "@mui/material";
import { useRouter } from "next/navigation";
export default function PhotoAI() {
const router = useRouter();
  return (
   <>
    <div>PhotoAI Component</div>
    <Button variant="contained" onClick={() => router.push("/pages/user/roulette")}>Generate Photo</Button></>
  );
}   