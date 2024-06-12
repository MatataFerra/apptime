import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/Accordion";
import Stack from "@/components/ui/Stack";
import Text from "@/components/ui/Text";

function AccordionFaq() {
  return (
    <Accordion type="multiple">
      <AccordionItem value="FAQ">
        <AccordionTrigger>
          <Text classes="font-semibold">Brief information about taxes</Text>
        </AccordionTrigger>
        <AccordionContent>
          <AccordionItem value="two">
            <AccordionTrigger className="py-1 text-sm">How do we use your taxes?</AccordionTrigger>
            <AccordionContent>
              <Stack orientation="vertical" classes="w-full">
                <Text>
                  We use your taxes to calculate your production cost. This will help you to know
                  how much you need to pay for the production.
                </Text>
              </Stack>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="three">
            <AccordionTrigger className="py-1 text-sm">How to add a tax?</AccordionTrigger>
            <AccordionContent>
              <Stack orientation="vertical" classes="w-full">
                <Text>
                  Fill in the name of the tax and the value of the tax. You can also add a
                  description if you want.
                </Text>
              </Stack>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="four">
            <AccordionTrigger className="py-1 text-sm">
              Can I delete any tax after?
            </AccordionTrigger>
            <AccordionContent>
              <Stack orientation="vertical" classes="w-full">
                <Text>
                  Yes, you can delete any tax after adding it. You can also edit the tax if you
                  want. <strong>Just go to the dashboard</strong> and click on the tax you want to
                  delete or edit.
                </Text>
              </Stack>
            </AccordionContent>
          </AccordionItem>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

export default AccordionFaq;
