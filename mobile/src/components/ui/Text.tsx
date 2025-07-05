import { Text as TextDefault } from "react-native";
import { FontSize, FontFamily } from "@/constants";

const Text = (props: any) => {
  return (
    <TextDefault
      style={[FontSize.MD, FontFamily.REGULAR, { ...props.style }]}
      {...props}
    >
      {props.children}
    </TextDefault>
  );
};

export default Text;
