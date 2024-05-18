import Container from "@/components/structures/Settings/Container";
import Inputs from "@/components/structures/Settings/Personal/Inputs";
import Text from "@/components/ui/Text";

function Personal() {
  return (
    <Container>
      <Text classes="px-4 font-bold">Personal Details</Text>
      <Inputs />
    </Container>
  );
}

export default Personal;
