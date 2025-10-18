// Chakra Imports
import {
  Box,
  Button,
  Flex,
  Icon,
  Text,
  useColorMode,
  useColorModeValue,
  VStack,
  HStack,
  IconButton,
  Fade,
} from "@chakra-ui/react";
import React from "react";
import { FaMoon, FaSun, FaTimes } from "react-icons/fa";

export default function Configurator(props) {
  const { isOpen, onClose } = props;

  const { colorMode, toggleColorMode } = useColorMode();

  const bgCard = useColorModeValue("white", "navy.800");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.100");
  const textColor = useColorModeValue("gray.700", "white");
  const secondaryText = useColorModeValue("gray.600", "gray.400");

  if (!isOpen) return null;

  return (
    <Fade in={isOpen}>
      <Box
        position="fixed"
        right="35px"
        bottom="100px"
        zIndex="999"
        w="280px"
      >
        <Box
          bg={bgCard}
          borderRadius="20px"
          borderWidth="1px"
          borderColor={borderColor}
          boxShadow="0 20px 27px 0 rgba(0, 0, 0, 0.05)"
          p="20px"
        >
          <Flex justify="space-between" align="center" mb="16px">
            <Text fontSize="lg" fontWeight="bold" color={textColor}>
              Configuración
            </Text>
            <IconButton
              icon={<Icon as={FaTimes} />}
              onClick={onClose}
              size="sm"
              variant="ghost"
              aria-label="Cerrar configuración"
            />
          </Flex>

          <VStack spacing="16px" align="stretch">
            <Box>
              <Text fontSize="sm" fontWeight="600" color={secondaryText} mb="10px">
                Apariencia
              </Text>
              <HStack spacing="8px">
                <Button
                  leftIcon={<Icon as={FaSun} />}
                  onClick={colorMode === "dark" ? toggleColorMode : undefined}
                  colorScheme="blue"
                  variant={colorMode === "light" ? "solid" : "outline"}
                  size="sm"
                  flex="1"
                  isDisabled={colorMode === "light"}
                >
                  Claro
                </Button>
                <Button
                  leftIcon={<Icon as={FaMoon} />}
                  onClick={colorMode === "light" ? toggleColorMode : undefined}
                  colorScheme="blue"
                  variant={colorMode === "dark" ? "solid" : "outline"}
                  size="sm"
                  flex="1"
                  isDisabled={colorMode === "dark"}
                >
                  Oscuro
                </Button>
              </HStack>
            </Box>
          </VStack>
        </Box>
      </Box>
    </Fade>
  );
}
