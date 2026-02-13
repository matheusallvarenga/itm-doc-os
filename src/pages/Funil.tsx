import { useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import {
  MapPin,
  CheckCircle,
  Sparkle,
  Calculator,
  Plus,
  Trash,
  TrendUp,
  Lightning,
  Info,
  ShareNetwork,
  DownloadSimple,
  CaretRight,
  CurrencyDollar,
  UsersThree,
  CalendarCheck,
  Target,
  UserCheck,
  FloppyDisk,
  ChatCircle,
  FileText,
  Users,
  Heart,
  Brain,
  Storefront,
  Wrench,
  Wallet,
} from "@phosphor-icons/react";

// Mock data
const specialties = [
  { id: "faceta", name: "Faceta/Lente", avgHours: 8 },
  { id: "implante", name: "Implante", avgHours: 4 },
  { id: "ortodontia", name: "Ortodontia", avgHours: 2 },
  { id: "clinico", name: "Clínico Geral", avgHours: 1 },
  { id: "endodontia", name: "Endodontia", avgHours: 2 },
  { id: "periodontia", name: "Periodontia", avgHours: 3 },
  { id: "protese", name: "Prótese", avgHours: 6 },
  { id: "cirurgia", name: "Cirurgia", avgHours: 3 },
];

const cities = [
  { id: "1", name: "Florianópolis", state: "SC", population: 516524, classification: "capital" as const },
  { id: "2", name: "São Paulo", state: "SP", population: 12325232, classification: "capital" as const },
  { id: "3", name: "Joinville", state: "SC", population: 597658, classification: "grande" as const },
  { id: "4", name: "Blumenau", state: "SC", population: 361855, classification: "grande" as const },
  { id: "5", name: "Chapecó", state: "SC", population: 224013, classification: "media" as const },
  { id: "6", name: "Lages", state: "SC", population: 157743, classification: "pequena" as const },
  { id: "7", name: "Tubarão", state: "SC", population: 107339, classification: "pequena" as const },
  { id: "8", name: "Curitiba", state: "PR", population: 1963726, classification: "capital" as const },
  { id: "9", name: "Porto Alegre", state: "RS", population: 1492530, classification: "capital" as const },
];

interface Patient {
  id: string;
  name: string;
  value: number;
}

export default function Funil() {
  // City selection
  const [citySearch, setCitySearch] = useState("");
  const [selectedCity, setSelectedCity] = useState<typeof cities[0] | null>(null);
  const [cityConfirmed, setCityConfirmed] = useState(false);

  // Step 1: CPF
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [hoursPerMonth, setHoursPerMonth] = useState(160);
  const [hoursPerTreatment, setHoursPerTreatment] = useState(8);

  // Step 2: Ticket Médio
  const [usePatientTable, setUsePatientTable] = useState(true);
  const [patients, setPatients] = useState<Patient[]>([
    { id: "1", name: "Fernanda", value: 12800 },
    { id: "2", name: "Joao", value: 9500 },
    { id: "3", name: "Marcela", value: 16900 },
    { id: "4", name: "Daniel", value: 8900 },
  ]);
  const [manualTicket, setManualTicket] = useState(12025);
  const [newPatientName, setNewPatientName] = useState("");
  const [newPatientValue, setNewPatientValue] = useState("");

  // Simulation sliders
  const [simLeadToEval, setSimLeadToEval] = useState(30);
  const [simEvalToClose, setSimEvalToClose] = useState(30);
  const [simTicket, setSimTicket] = useState(12025);

  // Filter cities
  const filteredCities = cities.filter(
    (city) =>
      city.name.toLowerCase().includes(citySearch.toLowerCase()) ||
      city.state.toLowerCase().includes(citySearch.toLowerCase())
  );

  // Conversion rates
  const getCityConversionRate = (classification: string) => {
    switch (classification) {
      case "pequena": return 0.5;
      case "media": return 0.4;
      case "capital":
      case "grande": return 0.3;
      default: return 0.3;
    }
  };

  const getTicketConversionRate = (ticket: number) => {
    if (ticket < 1000) return 0.5;
    if (ticket < 5000) return 0.4;
    return 0.3;
  };

  // Calculations
  const i5_cpf = useMemo(() => {
    if (hoursPerTreatment === 0) return 0;
    return Math.floor(hoursPerMonth / hoursPerTreatment);
  }, [hoursPerMonth, hoursPerTreatment]);

  const averageTicket = useMemo(() => {
    if (usePatientTable) {
      if (patients.length === 0) return 0;
      return patients.reduce((sum, p) => sum + p.value, 0) / patients.length;
    }
    return manualTicket;
  }, [usePatientTable, patients, manualTicket]);

  const i3_fechamentos = i5_cpf;

  const rateEvalToClose = useMemo(() => getTicketConversionRate(averageTicket), [averageTicket]);
  const i2_avaliacoes = useMemo(() => {
    return Math.ceil(i3_fechamentos / rateEvalToClose);
  }, [i3_fechamentos, rateEvalToClose]);

  const rateLeadToEval = useMemo(() => {
    if (!selectedCity) return 0.3;
    return getCityConversionRate(selectedCity.classification);
  }, [selectedCity]);

  const i1_contatos = useMemo(() => {
    return Math.ceil(i2_avaliacoes / rateLeadToEval);
  }, [i2_avaliacoes, rateLeadToEval]);

  const monthlyRevenue = i3_fechamentos * averageTicket;

  // Simulation calculations
  const simulated = useMemo(() => {
    const simRateEval = simEvalToClose / 100;
    const simRateLead = simLeadToEval / 100;
    
    const simI3 = i5_cpf;
    const simI2 = simRateEval > 0 ? Math.ceil(simI3 / simRateEval) : 0;
    const simI1 = simRateLead > 0 ? Math.ceil(simI2 / simRateLead) : 0;
    const simRevenue = simI3 * simTicket;
    
    return {
      i1: simI1,
      i2: simI2,
      i3: simI3,
      revenue: simRevenue,
      difference: simRevenue - monthlyRevenue,
      percentChange: monthlyRevenue > 0 ? ((simRevenue - monthlyRevenue) / monthlyRevenue) * 100 : 0,
    };
  }, [i5_cpf, simLeadToEval, simEvalToClose, simTicket, monthlyRevenue]);

  // Patient table handlers
  const addPatient = () => {
    if (newPatientName && newPatientValue) {
      setPatients([
        ...patients,
        { id: Date.now().toString(), name: newPatientName, value: Number(newPatientValue) },
      ]);
      setNewPatientName("");
      setNewPatientValue("");
    }
  };

  const removePatient = (id: string) => {
    setPatients(patients.filter((p) => p.id !== id));
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat("pt-BR").format(value);
  };

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Hero Section */}
        <section className="grid lg:grid-cols-2 gap-8 items-center py-8">
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                Funil de <span className="text-primary">Vendas</span>
              </h1>
              <p className="text-lg text-muted-foreground">
                Descubra sua <strong className="text-foreground">capacidade real de atendimento</strong> e veja como pequenas melhorias geram resultados exponenciais no seu consultório.
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="gap-2">
                <Calculator weight="bold" className="w-5 h-5" />
                Calcular Agora
              </Button>
              <Button size="lg" variant="outline" className="gap-2">
                <Lightning weight="regular" className="w-5 h-5" />
                Ver Simulador
              </Button>
            </div>
          </div>

          {/* i95D Method Diagram */}
          <Card className="bg-card/50 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-primary/20 text-primary font-bold px-4 py-2 rounded-lg">
                  i95D
                </div>
                <span className="text-sm text-muted-foreground">9 INDICADORES / 5 DIMENSÕES</span>
              </div>
              
              <div className="space-y-3">
                {/* 1ª Dimensão */}
                <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50">
                  <Heart weight="duotone" className="w-5 h-5 text-primary" />
                  <div>
                    <span className="text-xs text-muted-foreground">1ª DIMENSÃO</span>
                    <p className="text-sm font-medium">Coração</p>
                  </div>
                </div>
                
                {/* 2ª Dimensão */}
                <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50">
                  <Brain weight="duotone" className="w-5 h-5 text-primary" />
                  <div>
                    <span className="text-xs text-muted-foreground">2ª DIMENSÃO</span>
                    <p className="text-sm font-medium">Cabeça</p>
                  </div>
                </div>
                
                {/* 3ª Dimensão */}
                <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50">
                  <Storefront weight="duotone" className="w-5 h-5 text-primary" />
                  <div className="flex-1">
                    <span className="text-xs text-muted-foreground">3ª DIMENSÃO</span>
                    <p className="text-sm font-medium">Comercial</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">i1 Contatos</span>
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">i2 Avaliações</span>
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">i3 Fechamentos</span>
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">i4 TKT Médio</span>
                    </div>
                  </div>
                </div>
                
                {/* 4ª Dimensão */}
                <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50">
                  <Wrench weight="duotone" className="w-5 h-5 text-primary" />
                  <div className="flex-1">
                    <span className="text-xs text-muted-foreground">4ª DIMENSÃO</span>
                    <p className="text-sm font-medium">Técnica</p>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded mt-1 inline-block">i5 Pacientes Finalizados</span>
                  </div>
                </div>
                
                {/* 5ª Dimensão */}
                <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50">
                  <Wallet weight="duotone" className="w-5 h-5 text-primary" />
                  <div className="flex-1">
                    <span className="text-xs text-muted-foreground">5ª DIMENSÃO</span>
                    <p className="text-sm font-medium">Financeira</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded">i6-i9 Custos</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Section Header */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl md:text-3xl font-bold">Calcule Seu Funil Passo a Passo</h2>
          <p className="text-muted-foreground">Vamos construir seu entendimento sobre o método i95D</p>
          <p className="text-sm text-muted-foreground">O Funil de Vendas é um sistema onde cada parte alimenta a outra. Vamos calcular cada indicador.</p>
        </div>

        {/* City Selection */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <MapPin weight="duotone" className="w-6 h-6 text-primary" />
              <div>
                <CardTitle>Sua Localização</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  A taxa de conversão varia conforme o tamanho da cidade (padrões i95D - 22 anos de mercado)
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <div className="flex-1">
                <Label htmlFor="city">Digite sua cidade</Label>
                <Input
                  id="city"
                  placeholder="Ex: Florianópolis"
                  value={citySearch}
                  onChange={(e) => {
                    setCitySearch(e.target.value);
                    setCityConfirmed(false);
                  }}
                />
                {citySearch && !cityConfirmed && filteredCities.length > 0 && (
                  <div className="mt-2 bg-card border border-border rounded-lg overflow-hidden">
                    {filteredCities.slice(0, 5).map((city) => (
                      <button
                        key={city.id}
                        className="w-full px-4 py-2 text-left hover:bg-muted transition-colors flex justify-between items-center"
                        onClick={() => {
                          setSelectedCity(city);
                          setCitySearch(`${city.name} - ${city.state}`);
                        }}
                      >
                        <span>{city.name} - {city.state}</span>
                        <span className="text-xs text-muted-foreground">{formatNumber(city.population)} hab.</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <Button
                className="mt-6 gap-2"
                disabled={!selectedCity}
                onClick={() => setCityConfirmed(true)}
              >
                <CheckCircle weight="fill" className="w-4 h-4" />
                Confirmar
              </Button>
            </div>

            {cityConfirmed && selectedCity && (
              <Card className="bg-primary/10 border-primary/30">
                <CardContent className="p-4">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-lg">{selectedCity.name} - {selectedCity.state}</h3>
                      <p className="text-sm text-muted-foreground">
                        {formatNumber(selectedCity.population)} habitantes • {selectedCity.classification.charAt(0).toUpperCase() + selectedCity.classification.slice(1)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Taxa de conversão Lead→Avaliação</p>
                      <p className="text-2xl font-bold text-primary">{(getCityConversionRate(selectedCity.classification) * 100).toFixed(0)}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Info weight="regular" className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Padrões i95D (22 anos de mercado):</p>
                    <p className="text-xs text-muted-foreground mt-1">Essas taxas foram validadas em milhares de consultórios</p>
                    <ul className="text-sm mt-2 space-y-1">
                      <li>• Cidade &lt; 200k habitantes: <span className="text-primary font-semibold">50%</span></li>
                      <li>• Cidade 200k - 999k (não capital): <span className="text-primary font-semibold">40%</span></li>
                      <li>• Capital: <span className="text-primary font-semibold">30%</span></li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </CardContent>
        </Card>

        {/* Step 1: CPF */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                1
              </div>
              <CardTitle>Passo 1 - Calcule seu CPF (Capacidade de Pacientes Finalizados)</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label>Escolha sua Especialidade</Label>
              <Select value={selectedSpecialty} onValueChange={(val) => {
                setSelectedSpecialty(val);
                const specialty = specialties.find(s => s.id === val);
                if (specialty) setHoursPerTreatment(specialty.avgHours);
              }}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Selecione sua especialidade">
                    {selectedSpecialty && (
                      <span className="flex items-center gap-2">
                        <Sparkle weight="fill" className="w-4 h-4 text-primary" />
                        {specialties.find(s => s.id === selectedSpecialty)?.name}
                      </span>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {specialties.map((specialty) => (
                    <SelectItem key={specialty.id} value={specialty.id}>
                      {specialty.name} - {specialty.avgHours}h média
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="hoursMonth">Horas Disponíveis por Mês</Label>
                <Input
                  id="hoursMonth"
                  type="number"
                  value={hoursPerMonth}
                  onChange={(e) => setHoursPerMonth(Number(e.target.value))}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="hoursTreatment">Horas para Finalizar 1 Tratamento</Label>
                <Input
                  id="hoursTreatment"
                  type="number"
                  value={hoursPerTreatment}
                  onChange={(e) => setHoursPerTreatment(Number(e.target.value))}
                  className="mt-2"
                />
              </div>
            </div>

            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground mb-2">Cálculo visual:</p>
                <p className="font-mono text-sm">
                  {hoursPerMonth}h ÷ {hoursPerTreatment}h/tratamento = <span className="text-primary font-bold">{i5_cpf} pacientes</span>
                </p>
                <div className="mt-4 bg-primary/20 border border-primary rounded-lg p-4 text-center">
                  <p className="text-xs text-muted-foreground mb-1">i5 (CPF)</p>
                  <p className="text-4xl font-bold text-primary">{i5_cpf}</p>
                </div>
                <p className="text-sm italic text-muted-foreground mt-3">
                  Você consegue finalizar {i5_cpf} pacientes por mês
                </p>
              </CardContent>
            </Card>
          </CardContent>
        </Card>

        {/* Step 2: Ticket Médio */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                  2
                </div>
                <CardTitle>Passo 2 - Calcule seu Ticket Médio</CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="useTable" className="text-sm">Usar Tabela de Pacientes</Label>
                <Switch
                  id="useTable"
                  checked={usePatientTable}
                  onCheckedChange={setUsePatientTable}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {usePatientTable ? (
              <>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Pacientes do Último Mês</p>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Nome"
                      value={newPatientName}
                      onChange={(e) => setNewPatientName(e.target.value)}
                      className="w-32"
                    />
                    <Input
                      placeholder="Valor (R$)"
                      type="number"
                      value={newPatientValue}
                      onChange={(e) => setNewPatientValue(e.target.value)}
                      className="w-32"
                    />
                    <Button onClick={addPatient} size="icon" variant="outline">
                      <Plus weight="bold" className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome do Paciente</TableHead>
                      <TableHead>Valor do Tratamento (R$)</TableHead>
                      <TableHead className="w-16">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {patients.map((patient) => (
                      <TableRow key={patient.id}>
                        <TableCell>{patient.name}</TableCell>
                        <TableCell>{formatCurrency(patient.value)}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removePatient(patient.id)}
                          >
                            <Trash weight="regular" className="w-4 h-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <Card className="bg-muted/50">
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground mb-2">Cálculo:</p>
                    <p className="font-mono text-sm mb-4">
                      ({patients.map(p => formatCurrency(p.value)).join(" + ")}) ÷ {patients.length}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Ticket Médio</span>
                      <span className="text-2xl font-bold text-primary">{formatCurrency(averageTicket)}</span>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <div>
                <Label htmlFor="manualTicket">Ticket Médio (R$)</Label>
                <Input
                  id="manualTicket"
                  type="number"
                  value={manualTicket}
                  onChange={(e) => setManualTicket(Number(e.target.value))}
                  className="mt-2"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Step 3: Fechamentos */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                3
              </div>
              <CardTitle>Passo 3 - Seus Fechamentos (i3)</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <Card className="bg-muted/50 mb-4">
              <CardContent className="p-4">
                <p className="text-sm">No método i95D:</p>
                <p className="font-semibold text-primary">i3 (Fechamentos) = i5 (CPF)</p>
                <p className="text-sm text-muted-foreground mt-1">Assumimos que todos os pacientes finalizados foram fechados</p>
              </CardContent>
            </Card>
            <div className="bg-primary/20 border border-primary rounded-lg p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">i3 (Fechamentos)</p>
              <p className="text-4xl font-bold text-primary">{i3_fechamentos}</p>
            </div>
          </CardContent>
        </Card>

        {/* Step 4: Avaliações */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                4
              </div>
              <CardTitle>Passo 4 - Avaliações Necessárias (i2)</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-4">
                <p className="font-medium text-sm">Padrões i95D (22 anos de mercado):</p>
                <ul className="text-sm mt-2 space-y-1">
                  <li>• Ticket &lt; R$ 1.000: <span className="text-primary font-semibold">50%</span></li>
                  <li>• Ticket R$ 1.001 - R$ 4.999: <span className="text-primary font-semibold">40%</span></li>
                  <li>• Ticket ≥ R$ 5.000: <span className="text-primary font-semibold">30%</span></li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Seu ticket: <span className="text-foreground">{formatCurrency(averageTicket)}</span></p>
                <p className="text-sm">Taxa de conversão aplicada: <span className="text-primary font-semibold">{(rateEvalToClose * 100).toFixed(0)}%</span></p>
                <p className="font-mono text-sm mt-3">
                  i2 = i3 ÷ {rateEvalToClose} = {i3_fechamentos} ÷ {rateEvalToClose} = <span className="text-primary font-bold">{i2_avaliacoes}</span>
                </p>
              </CardContent>
            </Card>

            <div className="bg-primary/20 border border-primary rounded-lg p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">i2 (Avaliações)</p>
              <p className="text-4xl font-bold text-primary">{i2_avaliacoes}</p>
            </div>
            <p className="text-sm italic text-muted-foreground">
              Você precisa de {i2_avaliacoes} avaliações para fechar {i3_fechamentos} tratamentos
            </p>
          </CardContent>
        </Card>

        {/* Step 5: Contatos */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                5
              </div>
              <CardTitle>Passo 5 - Contatos Necessários (i1)</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">
                  Sua cidade: <span className="text-foreground">{selectedCity?.name || "Não selecionada"} {selectedCity ? `(${selectedCity.classification.charAt(0).toUpperCase() + selectedCity.classification.slice(1)})` : ""}</span>
                </p>
                <p className="text-sm">Taxa de conversão aplicada: <span className="text-primary font-semibold">{(rateLeadToEval * 100).toFixed(0)}%</span></p>
                <p className="font-mono text-sm mt-3">
                  i1 = i2 ÷ {rateLeadToEval} = {i2_avaliacoes} ÷ {rateLeadToEval} = <span className="text-primary font-bold">{i1_contatos}</span>
                </p>
              </CardContent>
            </Card>

            <div className="bg-primary/20 border border-primary rounded-lg p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">i1 (Contatos)</p>
              <p className="text-4xl font-bold text-primary">{i1_contatos}</p>
            </div>
            <p className="text-sm italic text-muted-foreground">
              Você precisa de {i1_contatos} leads para gerar {i2_avaliacoes} avaliações
            </p>
          </CardContent>
        </Card>

        {/* Complete Funnel */}
        <Card className="border-primary/30">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Calculator weight="duotone" className="w-6 h-6 text-primary" />
              <div>
                <CardTitle>Seu Funil Completo</CardTitle>
                <p className="text-sm text-muted-foreground">Esse é o seu funil de vendas baseado no método i95D</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Funnel Flow */}
            <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4 mb-8">
              <div className="text-center p-4 bg-muted rounded-lg">
                <UsersThree weight="duotone" className="w-6 h-6 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold text-primary">{i1_contatos}</p>
                <p className="text-xs text-muted-foreground">contatos</p>
              </div>
              <CaretRight weight="bold" className="w-5 h-5 text-muted-foreground" />
              <div className="text-center p-4 bg-muted rounded-lg">
                <CalendarCheck weight="duotone" className="w-6 h-6 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold text-primary">{i2_avaliacoes}</p>
                <p className="text-xs text-muted-foreground">avaliações</p>
              </div>
              <CaretRight weight="bold" className="w-5 h-5 text-muted-foreground" />
              <div className="text-center p-4 bg-muted rounded-lg">
                <Target weight="duotone" className="w-6 h-6 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold text-primary">{i3_fechamentos}</p>
                <p className="text-xs text-muted-foreground">fechamentos</p>
              </div>
              <CaretRight weight="bold" className="w-5 h-5 text-muted-foreground" />
              <div className="text-center p-4 bg-muted rounded-lg">
                <CurrencyDollar weight="duotone" className="w-6 h-6 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold text-primary">{formatCurrency(averageTicket)}</p>
                <p className="text-xs text-muted-foreground">ticket médio</p>
              </div>
              <CaretRight weight="bold" className="w-5 h-5 text-muted-foreground" />
              <div className="text-center p-4 bg-muted rounded-lg">
                <UserCheck weight="duotone" className="w-6 h-6 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold text-primary">{i5_cpf}</p>
                <p className="text-xs text-muted-foreground">CPF</p>
              </div>
            </div>

            {/* Revenue Card */}
            <Card className="bg-gradient-to-r from-primary/20 to-primary/5 border-primary/30">
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <TrendUp weight="bold" className="w-6 h-6 text-primary" />
                  <span className="text-sm text-muted-foreground">Faturamento Mensal Projetado</span>
                </div>
                <p className="text-4xl md:text-5xl font-bold text-foreground">{formatCurrency(monthlyRevenue)}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {i3_fechamentos} fechamentos × {formatCurrency(averageTicket)} = {formatCurrency(monthlyRevenue)}
                </p>
              </CardContent>
            </Card>
          </CardContent>
        </Card>

        {/* Simulator */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Lightning weight="duotone" className="w-6 h-6 text-primary" />
              <div>
                <CardTitle>E Se Você Melhorasse Apenas...</CardTitle>
                <p className="text-sm text-muted-foreground">Ajuste os sliders e veja o impacto de pequenas melhorias no seu faturamento</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <h4 className="font-semibold mb-1">Simule Melhorias</h4>
                <p className="text-sm text-muted-foreground">Cada pequeno ajuste pode gerar resultados exponenciais</p>
                <p className="text-xs text-muted-foreground mt-1">Esse é o poder do Funil de Vendas - pequenas melhorias em cada etapa se multiplicam</p>
              </CardContent>
            </Card>

            {/* Slider 1 */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label>Taxa de Conversão Lead → Comparecimento</Label>
                <span className="text-primary font-semibold">{simLeadToEval}%</span>
              </div>
              <Slider
                value={[simLeadToEval]}
                onValueChange={(val) => setSimLeadToEval(val[0])}
                min={10}
                max={70}
                step={5}
              />
              <p className="text-sm italic text-muted-foreground">
                E se você ajustasse sua taxa de conversão para {simLeadToEval}%?
              </p>
            </div>

            {/* Slider 2 */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label>Taxa de Conversão Comparecimento → Fechamento</Label>
                <span className="text-primary font-semibold">{simEvalToClose}%</span>
              </div>
              <Slider
                value={[simEvalToClose]}
                onValueChange={(val) => setSimEvalToClose(val[0])}
                min={10}
                max={70}
                step={5}
              />
              <p className="text-sm italic text-muted-foreground">
                E se você fechasse {simEvalToClose}% das avaliações realizadas?
              </p>
            </div>

            {/* Slider 3 */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label>Ticket Médio</Label>
                <span className="text-primary font-semibold">{formatCurrency(simTicket)}</span>
              </div>
              <Slider
                value={[simTicket]}
                onValueChange={(val) => setSimTicket(val[0])}
                min={1000}
                max={50000}
                step={500}
              />
              <p className="text-sm italic text-muted-foreground">
                E se seu ticket médio fosse de {formatCurrency(simTicket)}?
              </p>
            </div>

            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-4 flex items-center gap-3">
                <Info weight="regular" className="w-5 h-5 text-primary" />
                <p className="text-sm">Ajuste os sliders acima para simular melhorias e ver o impacto no seu consultório</p>
              </CardContent>
            </Card>

            {/* Comparison */}
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="bg-muted/50">
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-4">Atual</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Faturamento</span>
                      <span className="font-semibold">{formatCurrency(monthlyRevenue)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Contatos necessários</span>
                      <span>{i1_contatos}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Avaliações</span>
                      <span>{i2_avaliacoes}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Fechamentos</span>
                      <span>{i3_fechamentos}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-primary/10 border-primary/30">
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-4 text-primary">Simulado</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Faturamento</span>
                      <span className="font-semibold text-green-500">{formatCurrency(simulated.revenue)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Contatos necessários</span>
                      <span>{simulated.i1}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Avaliações</span>
                      <span>{simulated.i2}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Fechamentos</span>
                      <span>{simulated.i3}</span>
                    </div>
                  </div>
                  {simulated.difference !== 0 && (
                    <div className="mt-4 pt-4 border-t border-primary/20">
                      <p className={`font-semibold ${simulated.difference > 0 ? "text-green-500" : "text-destructive"}`}>
                        {simulated.difference > 0 ? "+" : ""}{formatCurrency(simulated.difference)} ({simulated.percentChange.toFixed(1)}%)
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Final Insight */}
        <Card className="bg-primary/10 border-primary/30">
          <CardContent className="p-6">
            <p className="text-xl font-bold text-primary mb-2">
              Viu como pequenas melhorias percentuais geram resultados exponenciais?
            </p>
            <p className="text-foreground">
              É isso que chamamos de <strong>Funil de Vendas</strong> - um sistema onde cada parte alimenta a outra!
            </p>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 justify-center">
          <Button size="lg" className="gap-2">
            <FloppyDisk weight="bold" className="w-5 h-5" />
            Salvar Meu Funil
          </Button>
          <Button size="lg" variant="outline" className="gap-2">
            <ShareNetwork weight="regular" className="w-5 h-5" />
            Compartilhar Resultado
          </Button>
          <Button size="lg" variant="outline" className="gap-2">
            <DownloadSimple weight="regular" className="w-5 h-5" />
            Exportar PDF
          </Button>
        </div>

        {/* Next Steps */}
        <Card>
          <CardHeader>
            <CardTitle>Agora que você conhece seu Funil...</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="bg-card hover:bg-muted/50 transition-colors cursor-pointer">
                <CardContent className="p-4">
                  <ChatCircle weight="duotone" className="w-8 h-8 text-primary mb-3" />
                  <h4 className="font-semibold mb-1">Melhore suas consultas</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Use o Analisador de Consultas para identificar onde você está perdendo pacientes
                  </p>
                  <Button variant="outline" size="sm">Analisar Consulta</Button>
                </CardContent>
              </Card>

              <Card className="bg-card hover:bg-muted/50 transition-colors cursor-pointer">
                <CardContent className="p-4">
                  <FileText weight="duotone" className="w-8 h-8 text-primary mb-3" />
                  <h4 className="font-semibold mb-1">Atraia mais leads</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Crie roteiros de vídeo que aumentam seus contatos (i1)
                  </p>
                  <Button variant="outline" size="sm">Criar Roteiro</Button>
                </CardContent>
              </Card>

              <Card className="bg-card hover:bg-muted/50 transition-colors cursor-pointer">
                <CardContent className="p-4">
                  <Users weight="duotone" className="w-8 h-8 text-primary mb-3" />
                  <h4 className="font-semibold mb-1">Feche mais pacientes</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Entenda o perfil de cada paciente e aumente sua taxa de fechamento (i2→i3)
                  </p>
                  <Button variant="outline" size="sm">Decodificar Paciente</Button>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
