import dynamic from "next/dynamic";

const Form = dynamic(() => import("@/components/structures/Compare/Form"), {
  ssr: false,
});

const Report = dynamic(() => import("@/components/structures/Compare/Report"), {
  ssr: false,
});

const Title = dynamic(() => import("@/components/structures/Compare/Title"), {
  ssr: false,
});

function Content() {
  return (
    <>
      <Title />
      <Form />
      <Report />
    </>
  );
}

export default Content;
