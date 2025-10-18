import React, { useState, useEffect } from "react";
import {
  Avatar,
  Badge,
  Flex,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorModeValue,
  Select,
  Input,
  Button,
  Grid,
  Box,
  Icon,
  useToast,
  Spinner,
  Center,
  ButtonGroup,
} from "@chakra-ui/react";
import { FaFilter, FaSync, FaFilePdf, FaFileExcel } from "react-icons/fa";
import Card from "components/Card/Card";
import CardBody from "components/Card/CardBody";
import CardHeader from "components/Card/CardHeader";
import activityLogService from "services/activityLogService";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

function ActivityLog() {
  const textColor = useColorModeValue("gray.700", "white");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const toast = useToast();

  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [filterModule, setFilterModule] = useState("");
  const [filterAction, setFilterAction] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadLogs();
    loadStats();
  }, []);

  const loadLogs = async () => {
    setLoading(true);
    const result = await activityLogService.getAllLogs(200, 0);
    if (result.success) {
      setLogs(result.data.logs || []);
      setFilteredLogs(result.data.logs || []);
    } else {
      toast({
        title: "Error",
        description: result.error,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
    setLoading(false);
  };

  const loadStats = async () => {
    const result = await activityLogService.getStats();
    if (result.success) {
      setStats(result.data);
    }
  };

  const getActionBadgeColor = (action) => {
    switch (action) {
      case "create":
      case "register":
        return "green";
      case "update":
        return "blue";
      case "delete":
        return "red";
      case "login":
        return "purple";
      case "logout":
        return "gray";
      case "toggle_status":
        return "orange";
      default:
        return "teal";
    }
  };

  const getActionLabel = (action) => {
    switch (action) {
      case "create":
        return "Crear";
      case "update":
        return "Actualizar";
      case "delete":
        return "Eliminar";
      case "login":
        return "Iniciar Sesión";
      case "logout":
        return "Cerrar Sesión";
      case "register":
        return "Registrar";
      case "toggle_status":
        return "Cambiar Estado";
      default:
        return action;
    }
  };

  const getModuleLabel = (module) => {
    const labels = {
      users: "Usuarios",
      roles: "Roles",
      permissions: "Permisos",
      products: "Productos",
      categories: "Categorías",
      suppliers: "Proveedores",
      supply_entries: "Entradas de Insumos",
      stock_movements: "Movimientos de Stock",
      sales: "Ventas",
      promotions: "Promociones",
      auth: "Autenticación",
    };
    return labels[module] || module;
  };

  // Filtrar logs
  useEffect(() => {
    let filtered = [...logs];

    if (filterModule) {
      filtered = filtered.filter((log) => log.module === filterModule);
    }

    if (filterAction) {
      filtered = filtered.filter((log) => log.action === filterAction);
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (log) =>
          log.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          log.user?.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          log.user?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredLogs(filtered);
  }, [filterModule, filterAction, searchQuery, logs]);

  const handleReset = () => {
    setFilterModule("");
    setFilterAction("");
    setSearchQuery("");
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("es-BO", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  // Exportar a PDF
  const exportToPDF = () => {
    const doc = new jsPDF({ orientation: "landscape" });

    // Título
    doc.setFontSize(18);
    doc.text("Bitácora de Actividades del Sistema", 14, 20);

    // Fecha de generación
    doc.setFontSize(10);
    doc.text(`Fecha de generación: ${new Date().toLocaleString("es-BO")}`, 14, 28);
    doc.text(`Total de registros: ${filteredLogs.length}`, 14, 34);

    // Preparar datos para la tabla
    const tableData = filteredLogs.map((log) => [
      log.user ? `${log.user.full_name} ${log.user.full_last_name}` : "Sistema",
      getModuleLabel(log.module),
      getActionLabel(log.action),
      log.description,
      formatDate(log.created_at),
      log.ip_address || "-",
    ]);

    // Crear tabla usando autoTable
    autoTable(doc, {
      startY: 40,
      head: [["Usuario", "Módulo", "Acción", "Descripción", "Fecha y Hora", "IP"]],
      body: tableData,
      theme: "grid",
      styles: { fontSize: 7, cellPadding: 2 },
      headStyles: { fillColor: [66, 153, 225], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      columnStyles: {
        0: { cellWidth: 35 }, // Usuario
        1: { cellWidth: 30 }, // Módulo
        2: { cellWidth: 25 }, // Acción
        3: { cellWidth: 80 }, // Descripción
        4: { cellWidth: 40 }, // Fecha
        5: { cellWidth: 30 }, // IP
      },
    });

    // Guardar PDF
    doc.save(`bitacora_${new Date().toISOString().split("T")[0]}.pdf`);

    toast({
      title: "PDF Generado",
      description: "La bitácora de actividades ha sido exportada a PDF",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  // Exportar a Excel
  const exportToExcel = () => {
    // Preparar datos
    const excelData = filteredLogs.map((log) => ({
      Usuario: log.user
        ? `${log.user.full_name} ${log.user.full_last_name}`
        : "Sistema",
      "Nombre Usuario": log.user?.username || "-",
      Módulo: getModuleLabel(log.module),
      Acción: getActionLabel(log.action),
      Descripción: log.description,
      "Fecha y Hora": formatDate(log.created_at),
      "Dirección IP": log.ip_address || "-",
      "ID Registro": log.id,
    }));

    // Crear libro de trabajo
    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Bitácora");

    // Ajustar ancho de columnas
    const colWidths = [
      { wch: 30 }, // Usuario
      { wch: 20 }, // Nombre Usuario
      { wch: 25 }, // Módulo
      { wch: 20 }, // Acción
      { wch: 60 }, // Descripción
      { wch: 22 }, // Fecha
      { wch: 18 }, // IP
      { wch: 40 }, // ID
    ];
    ws["!cols"] = colWidths;

    // Generar archivo
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(data, `bitacora_${new Date().toISOString().split("T")[0]}.xlsx`);

    toast({
      title: "Excel Generado",
      description: "La bitácora de actividades ha sido exportada a Excel",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  if (loading) {
    return (
      <Flex direction="column" pt={{ base: "120px", md: "75px" }}>
        <Center h="400px">
          <Spinner size="xl" color="teal.300" />
          <Text ml={4}>Cargando bitácora...</Text>
        </Center>
      </Flex>
    );
  }

  return (
    <Flex direction="column" pt={{ base: "120px", md: "75px" }}>
      {/* Estadísticas */}
      {stats && (
        <Grid templateColumns={{ sm: "1fr", md: "repeat(3, 1fr)" }} gap={4} mb="20px">
          <Card p="20px">
            <Text fontSize="sm" color="gray.500">
              Logs de Hoy
            </Text>
            <Text fontSize="2xl" fontWeight="bold" color={textColor}>
              {stats.today_logs}
            </Text>
          </Card>
          <Card p="20px">
            <Text fontSize="sm" color="gray.500">
              Total de Logs
            </Text>
            <Text fontSize="2xl" fontWeight="bold" color={textColor}>
              {stats.total_logs}
            </Text>
          </Card>
          <Card p="20px">
            <Button
              leftIcon={<FaSync />}
              onClick={loadLogs}
              variant="outline"
              colorScheme="blue"
              size="sm"
              w="full"
            >
              Actualizar
            </Button>
          </Card>
        </Grid>
      )}

      {/* Filtros */}
      <Card mb="20px" p="20px">
        <Flex align="center" mb="16px">
          <Icon as={FaFilter} me="10px" color="blue.500" />
          <Text fontSize="lg" color={textColor} fontWeight="bold">
            Filtros
          </Text>
        </Flex>
        <Grid templateColumns={{ sm: "1fr", md: "repeat(4, 1fr)" }} gap={4}>
          <Input
            placeholder="Buscar descripción o usuario..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            borderRadius="15px"
            size="lg"
          />
          <Select
            placeholder="Todos los módulos"
            value={filterModule}
            onChange={(e) => setFilterModule(e.target.value)}
            borderRadius="15px"
            size="lg"
          >
            <option value="users">Usuarios</option>
            <option value="roles">Roles</option>
            <option value="permissions">Permisos</option>
            <option value="products">Productos</option>
            <option value="categories">Categorías</option>
            <option value="suppliers">Proveedores</option>
            <option value="supply_entries">Entradas de Insumos</option>
            <option value="stock_movements">Movimientos de Stock</option>
            <option value="sales">Ventas</option>
            <option value="promotions">Promociones</option>
            <option value="auth">Autenticación</option>
          </Select>
          <Select
            placeholder="Todas las acciones"
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            borderRadius="15px"
            size="lg"
          >
            <option value="create">Crear</option>
            <option value="update">Actualizar</option>
            <option value="delete">Eliminar</option>
            <option value="login">Iniciar Sesión</option>
            <option value="logout">Cerrar Sesión</option>
            <option value="register">Registrar</option>
            <option value="toggle_status">Cambiar Estado</option>
          </Select>
          <Button
            leftIcon={<FaSync />}
            onClick={handleReset}
            variant="outline"
            colorScheme="blue"
            borderRadius="15px"
            size="lg"
          >
            Limpiar
          </Button>
        </Grid>
      </Card>

      {/* Tabla de actividades */}
      <Card overflowX={{ sm: "scroll", xl: "hidden" }} pb="0px">
        <CardHeader p="6px 0px 22px 0px">
          <Flex justify="space-between" align="center" flexWrap="wrap" gap={4}>
            <Text fontSize="xl" color={textColor} fontWeight="bold">
              Bitácora de Actividades del Sistema
            </Text>
            <Flex align="center" gap={3}>
              <ButtonGroup size="sm" isAttached variant="outline">
                <Button
                  leftIcon={<Icon as={FaFilePdf} />}
                  colorScheme="red"
                  onClick={exportToPDF}
                  isDisabled={filteredLogs.length === 0}
                >
                  PDF
                </Button>
                <Button
                  leftIcon={<Icon as={FaFileExcel} />}
                  colorScheme="green"
                  onClick={exportToExcel}
                  isDisabled={filteredLogs.length === 0}
                >
                  Excel
                </Button>
              </ButtonGroup>
              <Badge colorScheme="blue" p="6px 12px" borderRadius="8px">
                {filteredLogs.length} registros
              </Badge>
            </Flex>
          </Flex>
        </CardHeader>
        <CardBody>
          {filteredLogs.length === 0 ? (
            <Box p={4} bg="blue.50" borderRadius="md">
              <Text color="blue.800">No hay logs registrados aún.</Text>
            </Box>
          ) : (
            <Table variant="simple" color={textColor}>
              <Thead>
                <Tr>
                  <Th borderColor={borderColor} color="gray.400">
                    Usuario
                  </Th>
                  <Th borderColor={borderColor} color="gray.400">
                    Módulo
                  </Th>
                  <Th borderColor={borderColor} color="gray.400">
                    Acción
                  </Th>
                  <Th borderColor={borderColor} color="gray.400">
                    Descripción
                  </Th>
                  <Th borderColor={borderColor} color="gray.400">
                    Fecha y Hora
                  </Th>
                  <Th borderColor={borderColor} color="gray.400">
                    IP
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredLogs.map((log) => (
                  <Tr key={log.id}>
                    <Td borderColor={borderColor}>
                      <Flex align="center">
                        <Avatar
                          size="sm"
                          name={
                            log.user
                              ? `${log.user.full_name} ${log.user.full_last_name}`
                              : "Sistema"
                          }
                          me="10px"
                        />
                        <Text fontSize="sm" fontWeight="bold">
                          {log.user
                            ? `${log.user.full_name} ${log.user.full_last_name}`
                            : "Sistema"}
                        </Text>
                      </Flex>
                    </Td>
                    <Td borderColor={borderColor}>
                      <Text fontSize="sm">{getModuleLabel(log.module)}</Text>
                    </Td>
                    <Td borderColor={borderColor}>
                      <Badge
                        colorScheme={getActionBadgeColor(log.action)}
                        fontSize="sm"
                        p="3px 10px"
                        borderRadius="8px"
                      >
                        {getActionLabel(log.action)}
                      </Badge>
                    </Td>
                    <Td borderColor={borderColor}>
                      <Text fontSize="sm">{log.description}</Text>
                    </Td>
                    <Td borderColor={borderColor}>
                      <Text fontSize="sm">{formatDate(log.created_at)}</Text>
                    </Td>
                    <Td borderColor={borderColor}>
                      <Text fontSize="sm" fontFamily="monospace">
                        {log.ip_address || "-"}
                      </Text>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )}
        </CardBody>
      </Card>
    </Flex>
  );
}

export default ActivityLog;
