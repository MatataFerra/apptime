import dynamic from "next/dynamic";

const Button = dynamic(() => import("@/components/structures/Compare/Button"), {
  ssr: false,
});

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
      <Button />
      <Report />
    </>
  );
}

export default Content;
