import React, { useState, useEffect } from "react";
import {
  Flex,
  Box,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  useColorModeValue,
  Spinner,
  Center,
  Icon,
  IconButton,
  Tooltip,
  HStack,
  VStack,
  Select,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from "@chakra-ui/react";
import { RepeatIcon, CheckCircleIcon, DownloadIcon, ChevronDownIcon } from "@chakra-ui/icons";
import Card from "components/Card/Card";
import CardHeader from "components/Card/CardHeader";
import CardBody from "components/Card/CardBody";
import orderService from "services/orderService";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

function OrdersHistory() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");

  const textColor = useColorModeValue("gray.700", "white");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, statusFilter]);

  const loadOrders = async () => {
    setRefreshing(true);
    const result = await orderService.getAllOrders();
    if (result.success) {
      // Filtrar solo pedidos completados, entregados o cancelados
      const historyOrders = result.data.filter(
        (order) =>
          order.status === "completed" ||
          order.status === "delivered" ||
          order.status === "cancelled"
      );
      setOrders(historyOrders);
    }
    setLoading(false);
    setRefreshing(false);
  };

  const filterOrders = () => {
    if (statusFilter === "all") {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(orders.filter((order) => order.status === statusFilter));
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      completed: { label: "Concluido", color: "green" },
      delivered: { label: "Entregado", color: "teal" },
      cancelled: { label: "Cancelado", color: "red" },
    };

    const config = statusConfig[status] || { label: status, color: "gray" };

    return (
      <Badge colorScheme={config.color} fontSize="sm" p="4px 12px" borderRadius="md">
        {config.label}
      </Badge>
    );
  };

  const formatDateTime = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatTime = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const calculateWaitTime = (order) => {
    if (!order.createdAt || !order.receivedAt) return "N/A";

    const created = new Date(order.createdAt);
    const received = new Date(order.receivedAt);
    const diffMs = received - created;
    const diffMins = Math.round(diffMs / 60000);

    return `${diffMins} min`;
  };

  const calculatePreparationTime = (order) => {
    if (!order.receivedAt || !order.completedAt) return "N/A";

    const received = new Date(order.receivedAt);
    const completed = new Date(order.completedAt);
    const diffMs = completed - received;
    const diffMins = Math.round(diffMs / 60000);

    return `${diffMins} min`;
  };

  const calculateTotalTime = (order) => {
    if (!order.createdAt || !order.completedAt) return "N/A";

    const created = new Date(order.createdAt);
    const completed = new Date(order.completedAt);
    const diffMs = completed - created;
    const diffMins = Math.round(diffMs / 60000);

    return `${diffMins} min`;
  };

  const exportToExcel = () => {
    // Preparar datos para Excel
    const excelData = filteredOrders.map((order) => ({
      "N° Pedido": order.orderNumber,
      "Fecha/Hora Creación": formatDateTime(order.createdAt),
      "Vendedor": order.seller
        ? `${order.seller.full_name} ${order.seller.full_last_name}`.trim()
        : "N/A",
      "Cocinero": order.cook
        ? `${order.cook.full_name} ${order.cook.full_last_name}`.trim()
        : "N/A",
      "Estado": order.status === "completed" ? "Concluido" : order.status === "delivered" ? "Entregado" : "Cancelado",
      "Tiempo Espera": calculateWaitTime(order),
      "Tiempo Preparación": calculatePreparationTime(order),
      "Tiempo Total": calculateTotalTime(order),
      "Hora Recepción": formatTime(order.receivedAt),
      "Hora Conclusión": formatTime(order.completedAt),
      "Cantidad Items": order.details?.length || 0,
    }));

    // Crear libro de trabajo
    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Historial Pedidos");

    // Ajustar ancho de columnas
    const colWidths = [
      { wch: 20 }, // N° Pedido
      { wch: 20 }, // Fecha/Hora
      { wch: 25 }, // Vendedor
      { wch: 25 }, // Cocinero
      { wch: 12 }, // Estado
      { wch: 15 }, // Tiempo Espera
      { wch: 18 }, // Tiempo Preparación
      { wch: 15 }, // Tiempo Total
      { wch: 15 }, // Hora Recepción
      { wch: 15 }, // Hora Conclusión
      { wch: 12 }, // Cantidad Items
    ];
    ws["!cols"] = colWidths;

    // Generar archivo
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });

    const now = new Date();
    const filename = `Historial_Pedidos_${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}.xlsx`;

    saveAs(data, filename);
  };

  const exportToPDF = () => {
    const doc = new jsPDF("landscape");

    // Título
    doc.setFontSize(18);
    doc.text("Historial de Pedidos", 14, 22);

    // Fecha de generación
    doc.setFontSize(11);
    doc.text(`Fecha de generación: ${new Date().toLocaleString("es-ES")}`, 14, 30);
    doc.text(`Total de pedidos: ${filteredOrders.length}`, 14, 36);

    // Preparar datos para la tabla
    const tableData = filteredOrders.map((order) => [
      order.orderNumber,
      formatDateTime(order.createdAt),
      order.seller ? `${order.seller.full_name} ${order.seller.full_last_name}`.trim() : "N/A",
      order.cook ? `${order.cook.full_name} ${order.cook.full_last_name}`.trim() : "N/A",
      order.status === "completed" ? "Concluido" : order.status === "delivered" ? "Entregado" : "Cancelado",
      calculateWaitTime(order),
      calculatePreparationTime(order),
      calculateTotalTime(order),
      formatTime(order.receivedAt),
      formatTime(order.completedAt),
    ]);

    // Crear tabla
    autoTable(doc, {
      startY: 42,
      head: [
        [
          "N° Pedido",
          "Fecha/Hora",
          "Vendedor",
          "Cocinero",
          "Estado",
          "T. Espera",
          "T. Preparación",
          "T. Total",
          "Recepción",
          "Conclusión",
        ],
      ],
      body: tableData,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [66, 153, 225], textColor: 255, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { top: 42 },
    });

    // Guardar archivo
    const now = new Date();
    const filename = `Historial_Pedidos_${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}.pdf`;

    doc.save(filename);
  };

  if (loading) {
    return (
      <Flex direction="column" pt={{ base: "120px", md: "75px" }}>
        <Center h="400px">
          <Spinner size="xl" color="teal.300" />
        </Center>
      </Flex>
    );
  }

  return (
    <Flex direction="column" pt={{ base: "120px", md: "75px" }}>
      <Card overflowX={{ sm: "scroll", xl: "hidden" }} pb="0px">
        <CardHeader p="6px 0px 22px 0px">
          <Flex justify="space-between" align="center" mb={4}>
            <Box>
              <Text fontSize="xl" color={textColor} fontWeight="bold">
                Historial de Pedidos
              </Text>
              <Text fontSize="sm" color="gray.500" mt={1}>
                Registro completo de pedidos completados, entregados y cancelados
              </Text>
            </Box>
            <HStack spacing={3}>
              <Select
                size="sm"
                width="200px"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Todos los estados</option>
                <option value="completed">Concluidos</option>
                <option value="delivered">Entregados</option>
                <option value="cancelled">Cancelados</option>
              </Select>
              <Badge colorScheme="blue" p="6px 12px" borderRadius="8px" fontSize="md">
                {filteredOrders.length} pedidos
              </Badge>
              <Menu>
                <MenuButton
                  as={Button}
                  size="sm"
                  colorScheme="green"
                  leftIcon={<DownloadIcon />}
                  rightIcon={<ChevronDownIcon />}
                  isDisabled={filteredOrders.length === 0}
                >
                  Exportar
                </MenuButton>
                <MenuList>
                  <MenuItem onClick={exportToExcel}>
                    Exportar a Excel (.xlsx)
                  </MenuItem>
                  <MenuItem onClick={exportToPDF}>
                    Exportar a PDF
                  </MenuItem>
                </MenuList>
              </Menu>
              <Tooltip label="Actualizar">
                <IconButton
                  icon={<RepeatIcon />}
                  size="sm"
                  colorScheme="teal"
                  variant="outline"
                  onClick={() => loadOrders()}
                  isLoading={refreshing}
                />
              </Tooltip>
            </HStack>
          </Flex>
        </CardHeader>
        <CardBody>
          {filteredOrders.length === 0 ? (
            <Center h="200px">
              <VStack>
                <Icon as={CheckCircleIcon} w={10} h={10} color="gray.300" />
                <Text fontSize="lg" color="gray.500">
                  No hay pedidos en el historial
                </Text>
                <Text fontSize="sm" color="gray.400">
                  Los pedidos completados aparecerán aquí
                </Text>
              </VStack>
            </Center>
          ) : (
            <Box overflowX="auto">
              <Table variant="simple" color={textColor}>
                <Thead>
                  <Tr>
                    <Th borderColor={borderColor}>N° Pedido</Th>
                    <Th borderColor={borderColor}>Fecha/Hora Creación</Th>
                    <Th borderColor={borderColor}>Vendedor</Th>
                    <Th borderColor={borderColor}>Cocinero</Th>
                    <Th borderColor={borderColor}>Estado</Th>
                    <Th borderColor={borderColor}>Tiempo Espera</Th>
                    <Th borderColor={borderColor}>Tiempo Preparación</Th>
                    <Th borderColor={borderColor}>Tiempo Total</Th>
                    <Th borderColor={borderColor}>Hora Recepción</Th>
                    <Th borderColor={borderColor}>Hora Conclusión</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {filteredOrders.map((order) => (
                    <Tr key={order.id} _hover={{ bg: "gray.50" }}>
                      <Td borderColor={borderColor}>
                        <Text fontWeight="semibold" fontSize="sm">
                          {order.orderNumber}
                        </Text>
                        <Text fontSize="xs" color="gray.500" mt={1}>
                          {order.details?.length || 0} items
                        </Text>
                      </Td>
                      <Td borderColor={borderColor}>
                        <Text fontSize="sm">{formatDateTime(order.createdAt)}</Text>
                      </Td>
                      <Td borderColor={borderColor}>
                        <Text fontSize="sm">
                          {order.seller
                            ? `${order.seller.full_name} ${order.seller.full_last_name}`.trim()
                            : "N/A"}
                        </Text>
                      </Td>
                      <Td borderColor={borderColor}>
                        <Text fontSize="sm" fontWeight="semibold" color="blue.600">
                          {order.cook
                            ? `${order.cook.full_name} ${order.cook.full_last_name}`.trim()
                            : "N/A"}
                        </Text>
                      </Td>
                      <Td borderColor={borderColor}>{getStatusBadge(order.status)}</Td>
                      <Td borderColor={borderColor}>
                        <Badge colorScheme="orange" fontSize="sm">
                          {calculateWaitTime(order)}
                        </Badge>
                      </Td>
                      <Td borderColor={borderColor}>
                        <Badge colorScheme="purple" fontSize="sm">
                          {calculatePreparationTime(order)}
                        </Badge>
                      </Td>
                      <Td borderColor={borderColor}>
                        <Badge colorScheme="blue" fontSize="sm">
                          {calculateTotalTime(order)}
                        </Badge>
                      </Td>
                      <Td borderColor={borderColor}>
                        <Text fontSize="sm">{formatTime(order.receivedAt)}</Text>
                      </Td>
                      <Td borderColor={borderColor}>
                        <Text fontSize="sm">{formatTime(order.completedAt)}</Text>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          )}
        </CardBody>
      </Card>
    </Flex>
  );
}

export default OrdersHistory;
