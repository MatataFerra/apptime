import Inputs from "@/components/structures/Settings/Account/Inputs";
import Container from "@/components/structures/Settings/Container";
import Text from "@/components/ui/Text";

function Account() {
  return (
    <Container>
      <Text classes="px-4 font-bold">Account Details</Text>
      <Inputs />
    </Container>
  );
}

export default Account;
