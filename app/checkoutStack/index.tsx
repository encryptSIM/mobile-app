import { BackgroundWrapper } from "@/components/backgroundWrapper/BackgroundWrapper";
import { SelectPackageScreen } from "@/components/packageSelection/SelectPackageScreen";

export default function Home() {
  return (
    <BackgroundWrapper>
      <SelectPackageScreen />
    </BackgroundWrapper>
  )
}
