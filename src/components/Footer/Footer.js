/*eslint-disable*/
import { Flex, Link, List, ListItem, Text, useColorModeValue } from "@chakra-ui/react";
import React from "react";

export default function Footer(props) {
  const textColor = useColorModeValue("gray.600", "gray.300");

  return (
    <Flex
      flexDirection={{
        base: "column",
        xl: "row",
      }}
      alignItems={{
        base: "center",
        xl: "start",
      }}
      justifyContent='center'
      px='30px'
      py='30px'>
      <Text
        color={textColor}
        textAlign='center'
        mb={{ base: "20px", xl: "0px" }}
        fontWeight="medium">
        &copy; {1900 + new Date().getYear()} - Todos los derechos reservados
      </Text>
    </Flex>
  );
}
