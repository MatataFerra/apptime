import Container from "@/components/structures/Settings/Container";
import Inputs from "@/components/structures/Settings/Shift/Inputs";
import Text from "@/components/ui/Text";

function Shift() {
  return (
    <Container>
      <Text classes="px-4 font-bold">Shift Configurations</Text>
      <Inputs />
    </Container>
  );
}

export default Shift;
