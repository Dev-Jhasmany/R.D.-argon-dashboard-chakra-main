import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Flex,
  Text,
  Image,
  useColorModeValue,
  useToast,
  VStack,
  HStack,
  Icon,
  IconButton,
  Divider,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
} from "@chakra-ui/react";
import { AddIcon, MinusIcon, DeleteIcon } from "@chakra-ui/icons";
import { FiShoppingCart } from "react-icons/fi";
import { useHistory } from "react-router-dom";
import Card from "components/Card/Card";
import CardBody from "components/Card/CardBody";
import CardHeader from "components/Card/CardHeader";
import publicApi from "services/publicApi";

function Cart() {
  const textColor = useColorModeValue("gray.700", "white");
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const toast = useToast();
  const history = useHistory();

  const [cart, setCart] = useState([]);

  useEffect(() => {
    loadCart();
    syncCartStock(); // Sincronizar al cargar

    // Actualización automática del stock cada 10 segundos
    const intervalId = setInterval(() => {
      syncCartStock();
    }, 10000); // 10 segundos

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  const loadCart = () => {
    const savedCart = JSON.parse(localStorage.getItem("customerCart") || "[]");
    setCart(savedCart);
  };

  const syncCartStock = async () => {
    const currentCart = JSON.parse(localStorage.getItem("customerCart") || "[]");

    if (currentCart.length === 0) {
      return;
    }

    try {
      // Obtener productos actuales del backend
      const response = await publicApi.get('/products');
      const allProducts = response.data;

      let cartUpdated = false;
      let itemsRemoved = [];

      const updatedCart = currentCart.map((cartItem) => {
        const updatedProduct = allProducts.find((p) => p.id === cartItem.id);

        if (updatedProduct && updatedProduct.is_active) {
          const newStock = parseFloat(updatedProduct.stock);
          const oldStock = parseFloat(cartItem.stock);

          // Si el stock cambió
          if (newStock !== oldStock) {
            cartUpdated = true;

            // Si no hay stock, marcar para eliminar
            if (newStock === 0) {
              itemsRemoved.push(cartItem.name);
              return null;
            }

            // Si la cantidad en el carrito excede el nuevo stock
            if (cartItem.quantity > newStock) {
              return {
                ...cartItem,
                stock: newStock,
                quantity: Math.floor(newStock)
              };
            }

            return {
              ...cartItem,
              stock: newStock
            };
          }
        } else {
          // Producto inactivo o eliminado
          itemsRemoved.push(cartItem.name);
          cartUpdated = true;
          return null;
        }

        return cartItem;
      }).filter((item) => item !== null);

      if (cartUpdated) {
        localStorage.setItem("customerCart", JSON.stringify(updatedCart));
        setCart(updatedCart);
        window.dispatchEvent(new Event("cartUpdated"));

        if (itemsRemoved.length > 0) {
          toast({
            title: "Productos no disponibles",
            description: `${itemsRemoved.join(', ')} ya no están disponibles y fueron eliminados del carrito`,
            status: "warning",
            duration: 5000,
            isClosable: true,
            position: "top-right",
          });
        }
      }
    } catch (error) {
      console.error('Error al sincronizar stock del carrito:', error);
    }
  };

  const updateCart = (newCart) => {
    setCart(newCart);
    localStorage.setItem("customerCart", JSON.stringify(newCart));
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const increaseQuantity = (productId) => {
    const newCart = cart.map((item) => {
      if (item.id === productId) {
        if (item.quantity >= item.stock) {
          toast({
            title: "Stock insuficiente",
            description: `Solo hay ${item.stock} unidades disponibles`,
            status: "warning",
            duration: 3000,
            isClosable: true,
            position: "top-right",
          });
          return item;
        }
        return { ...item, quantity: item.quantity + 1 };
      }
      return item;
    });
    updateCart(newCart);
  };

  const decreaseQuantity = (productId) => {
    const newCart = cart.map((item) => {
      if (item.id === productId && item.quantity > 1) {
        return { ...item, quantity: item.quantity - 1 };
      }
      return item;
    });
    updateCart(newCart);
  };

  const removeFromCart = (productId) => {
    const newCart = cart.filter((item) => item.id !== productId);
    updateCart(newCart);
    toast({
      title: "Producto eliminado",
      description: "El producto se eliminó del carrito",
      status: "info",
      duration: 2000,
      isClosable: true,
      position: "top-right",
    });
  };

  const clearCart = () => {
    updateCart([]);
    toast({
      title: "Carrito vaciado",
      description: "Todos los productos fueron eliminados",
      status: "info",
      duration: 2000,
      isClosable: true,
      position: "top-right",
    });
  };

  const calculateSubtotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal(); // Aquí se pueden agregar impuestos o descuentos
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast({
        title: "Carrito vacío",
        description: "Agrega productos antes de continuar",
        status: "warning",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
      return;
    }
    history.push("/customer/checkout");
  };

  if (cart.length === 0) {
    return (
      <Box pt={{ base: "80px", md: "100px" }} px={{ base: "15px", md: "30px" }} pb="30px">
        <Card>
          <CardBody>
            <VStack spacing={6} py={12}>
              <Icon as={FiShoppingCart} w={20} h={20} color="gray.400" />
              <Text fontSize="2xl" fontWeight="bold" color={textColor}>
                Tu carrito está vacío
              </Text>
              <Text color="gray.500">
                Explora nuestros productos y agrega algunos al carrito
              </Text>
              <Button
                colorScheme="blue"
                size="lg"
                onClick={() => history.push("/customer/shop")}
              >
                Ir a la tienda
              </Button>
            </VStack>
          </CardBody>
        </Card>
      </Box>
    );
  }

  return (
    <Box pt={{ base: "80px", md: "100px" }} px={{ base: "15px", md: "30px" }} pb="30px">
      <Box mb={8}>
        <Text fontSize="3xl" fontWeight="bold" color={textColor} mb={2}>
          Carrito de Compras
        </Text>
        <Text color="gray.500">
          Revisa tus productos antes de finalizar la compra
        </Text>
      </Box>

      <Flex direction={{ base: "column", lg: "row" }} gap={6}>
        {/* Cart Items */}
        <Box flex={1}>
          <Card>
            <CardHeader p="12px 5px" mb="12px">
              <Flex justify="space-between" align="center">
                <Text fontSize="lg" color={textColor} fontWeight="bold">
                  Productos ({cart.length})
                </Text>
                <Button
                  size="sm"
                  variant="ghost"
                  colorScheme="red"
                  onClick={clearCart}
                >
                  Vaciar carrito
                </Button>
              </Flex>
            </CardHeader>
            <CardBody>
              <VStack spacing={4} align="stretch">
                {cart.map((item) => (
                  <Box
                    key={item.id}
                    p={4}
                    borderWidth="1px"
                    borderColor={borderColor}
                    borderRadius="md"
                  >
                    <Flex gap={4}>
                      {/* Image */}
                      <Box
                        w={{ base: "80px", md: "100px" }}
                        h={{ base: "80px", md: "100px" }}
                        bg="gray.100"
                        borderRadius="md"
                        overflow="hidden"
                        flexShrink={0}
                      >
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            w="100%"
                            h="100%"
                            objectFit="cover"
                          />
                        ) : (
                          <Flex
                            w="100%"
                            h="100%"
                            alignItems="center"
                            justifyContent="center"
                          >
                            <Icon
                              as={FiShoppingCart}
                              w={8}
                              h={8}
                              color="gray.400"
                            />
                          </Flex>
                        )}
                      </Box>

                      {/* Info */}
                      <Flex flex={1} direction="column" justify="space-between">
                        <Box>
                          <Text
                            fontSize={{ base: "md", md: "lg" }}
                            fontWeight="bold"
                            color={textColor}
                            mb={1}
                          >
                            {item.name}
                          </Text>
                          <Text
                            fontSize={{ base: "lg", md: "xl" }}
                            fontWeight="bold"
                            color="blue.500"
                          >
                            Bs. {item.price.toFixed(2)}
                          </Text>
                        </Box>

                        <Flex
                          justify="space-between"
                          align="center"
                          mt={2}
                          flexWrap="wrap"
                          gap={2}
                        >
                          {/* Quantity Controls */}
                          <HStack spacing={2}>
                            <IconButton
                              icon={<MinusIcon />}
                              onClick={() => decreaseQuantity(item.id)}
                              size="sm"
                              colorScheme="gray"
                              variant="outline"
                              isDisabled={item.quantity <= 1}
                            />
                            <Box
                              px={4}
                              py={1}
                              bg="gray.100"
                              borderRadius="md"
                              minW="60px"
                              textAlign="center"
                            >
                              <Text fontWeight="bold">{item.quantity}</Text>
                            </Box>
                            <IconButton
                              icon={<AddIcon />}
                              onClick={() => increaseQuantity(item.id)}
                              size="sm"
                              colorScheme="blue"
                              variant="outline"
                              isDisabled={item.quantity >= item.stock}
                            />
                          </HStack>

                          {/* Subtotal and Delete */}
                          <HStack spacing={4}>
                            <Text
                              fontSize={{ base: "lg", md: "xl" }}
                              fontWeight="bold"
                              color={textColor}
                            >
                              Bs. {(item.price * item.quantity).toFixed(2)}
                            </Text>
                            <IconButton
                              icon={<DeleteIcon />}
                              onClick={() => removeFromCart(item.id)}
                              colorScheme="red"
                              variant="ghost"
                              size="sm"
                            />
                          </HStack>
                        </Flex>
                      </Flex>
                    </Flex>
                  </Box>
                ))}
              </VStack>
            </CardBody>
          </Card>
        </Box>

        {/* Order Summary */}
        <Box w={{ base: "100%", lg: "400px" }}>
          <Card position="sticky" top="100px">
            <CardHeader p="12px 5px" mb="12px">
              <Text fontSize="lg" color={textColor} fontWeight="bold">
                Resumen del pedido
              </Text>
            </CardHeader>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <HStack justify="space-between">
                  <Text color="gray.600">Subtotal</Text>
                  <Text fontWeight="bold">
                    Bs. {calculateSubtotal().toFixed(2)}
                  </Text>
                </HStack>

                <HStack justify="space-between">
                  <Text color="gray.600">Envío</Text>
                  <Text fontWeight="bold" color="green.500">
                    Gratis
                  </Text>
                </HStack>

                <Divider />

                <HStack justify="space-between">
                  <Text fontSize="xl" fontWeight="bold">
                    Total
                  </Text>
                  <Text fontSize="2xl" fontWeight="bold" color="blue.500">
                    Bs. {calculateTotal().toFixed(2)}
                  </Text>
                </HStack>

                <Button
                  colorScheme="blue"
                  size="lg"
                  w="100%"
                  onClick={handleCheckout}
                  mt={4}
                >
                  Finalizar compra
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  w="100%"
                  onClick={() => history.push("/customer/shop")}
                >
                  Seguir comprando
                </Button>
              </VStack>
            </CardBody>
          </Card>
        </Box>
      </Flex>
    </Box>
  );
}

export default Cart;
