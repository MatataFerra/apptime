import NoScreenCompatibility from "@/components/modules/Desktop/Compatibility";

export const dynamic = "force-static";

export default async function NoMobile() {
  return (
    <>
      <NoScreenCompatibility />
    </>
  );
}
