import AccordionItemSettings from "@/components/structures/Settings/AccordionItem";
import Dropdown from "@/components/structures/Settings/Shift/Dropdown";

function Inputs() {
  return (
    <AccordionItemSettings value="shift" trigger="Your shifts">
      <Dropdown />
    </AccordionItemSettings>
  );
}

export default Inputs;
