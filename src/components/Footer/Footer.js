/*eslint-disable*/
import { Flex, Link, List, ListItem, Text } from "@chakra-ui/react";
import React from "react";

export default function Footer(props) {
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
      pb='20px'>
      <Text
        color='gray.400'
        textAlign='center'
        mb={{ base: "20px", xl: "0px" }}>
        &copy; {1900 + new Date().getYear()} - Todos los derechos reservados
      </Text>
    </Flex>
  );
}
