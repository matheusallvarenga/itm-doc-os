import { useState, useMemo, useEffect, useCallback } from "react";
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
  CircleNotch,
} from "@phosphor-icons/react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

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
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [funnelId, setFunnelId] = useState<string | null>(null);

  const [citySearch, setCitySearch] = useState("");
  const [selectedCity, setSelectedCity] = useState<typeof cities[0] | null>(null);
  const [cityConfirmed, setCityConfirmed] = useState(false);

  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [hoursPerMonth, setHoursPerMonth] = useState(160);
  const [hoursPerTreatment, setHoursPerTreatment] = useState(8);

  const [usePatientTable, setUsePatientTable] = useState(true);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [manualTicket, setManualTicket] = useState(12025);
  const [newPatientName, setNewPatientName] = useState("");
  const [newPatientValue, setNewPatientValue] = useState("");

  const [simLeadToEval, setSimLeadToEval] = useState(30);
  const [simEvalToClose, setSimEvalToClose] = useState(30);
  const [simTicket, setSimTicket] = useState(12025);

  // Load funnel data
  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase
        .from("funnel_data")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (data) {
        setFunnelId(data.id);
        setSelectedSpecialty(data.specialty || "");
        setHoursPerMonth(data.hours_per_month || 160);
        setHoursPerTreatment(data.hours_per_treatment || 8);
        setManualTicket(data.manual_ticket || 12025);
        setUsePatientTable(data.use_patient_table ?? true);
        if (data.patients && Array.isArray(data.patients)) {
          setPatients(data.patients as unknown as Patient[]);
        }
        if (data.city) {
          const found = cities.find(c => c.name === data.city);
          if (found) {
            setSelectedCity(found);
            setCitySearch(`${found.name} - ${found.state}`);
            setCityConfirmed(true);
          }
        }
      }
      setLoading(false);
    };
    load();
  }, [user]);

  // Save funnel data
  const saveFunnel = useCallback(async () => {
    if (!user) return;
    setSaving(true);
    const payload = {
      user_id: user.id,
      specialty: selectedSpecialty,
      hours_per_month: hoursPerMonth,
      hours_per_treatment: hoursPerTreatment,
      manual_ticket: manualTicket,
      use_patient_table: usePatientTable,
      patients: patients as any,
      city: selectedCity?.name || null,
      city_classification: selectedCity?.classification || null,
    };

    if (funnelId) {
      const { error } = await supabase.from("funnel_data").update(payload).eq("id", funnelId);
      if (error) { toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" }); }
      else { toast({ title: "Funil salvo!" }); }
    } else {
      const { data, error } = await supabase.from("funnel_data").insert(payload).select().single();
      if (error) { toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" }); }
      else { setFunnelId(data.id); toast({ title: "Funil salvo!" }); }
    }
    setSaving(false);
  }, [user, funnelId, selectedSpecialty, hoursPerMonth, hoursPerTreatment, manualTicket, usePatientTable, patients, selectedCity]);

  const filteredCities = cities.filter(
    (city) =>
      city.name.toLowerCase().includes(citySearch.toLowerCase()) ||
      city.state.toLowerCase().includes(citySearch.toLowerCase())
  );

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
  const i2_avaliacoes = useMemo(() => Math.ceil(i3_fechamentos / rateEvalToClose), [i3_fechamentos, rateEvalToClose]);
  const rateLeadToEval = useMemo(() => {
    if (!selectedCity) return 0.3;
    return getCityConversionRate(selectedCity.classification);
  }, [selectedCity]);
  const i1_contatos = useMemo(() => Math.ceil(i2_avaliacoes / rateLeadToEval), [i2_avaliacoes, rateLeadToEval]);
  const monthlyRevenue = i3_fechamentos * averageTicket;

  const simulated = useMemo(() => {
    const simRateEval = simEvalToClose / 100;
    const simRateLead = simLeadToEval / 100;
    const simI3 = i5_cpf;
    const simI2 = simRateEval > 0 ? Math.ceil(simI3 / simRateEval) : 0;
    const simI1 = simRateLead > 0 ? Math.ceil(simI2 / simRateLead) : 0;
    const simRevenue = simI3 * simTicket;
    return {
      i1: simI1, i2: simI2, i3: simI3, revenue: simRevenue,
      difference: simRevenue - monthlyRevenue,
      percentChange: monthlyRevenue > 0 ? ((simRevenue - monthlyRevenue) / monthlyRevenue) * 100 : 0,
    };
  }, [i5_cpf, simLeadToEval, simEvalToClose, simTicket, monthlyRevenue]);

  const addPatient = () => {
    if (newPatientName && newPatientValue) {
      setPatients([...patients, { id: Date.now().toString(), name: newPatientName, value: Number(newPatientValue) }]);
      setNewPatientName("");
      setNewPatientValue("");
    }
  };

  const removePatient = (id: string) => setPatients(patients.filter((p) => p.id !== id));

  const formatCurrency = (value: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 }).format(value);
  const formatNumber = (value: number) => new Intl.NumberFormat("pt-BR").format(value);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <CircleNotch weight="bold" className="w-8 h-8 text-primary animate-spin" />
        </div>
      </AppLayout>
    );
  }

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
              <Button size="lg" className="gap-2" onClick={saveFunnel} disabled={saving}>
                {saving ? <CircleNotch weight="bold" className="w-5 h-5 animate-spin" /> : <FloppyDisk weight="bold" className="w-5 h-5" />}
                {saving ? "Salvando..." : "Salvar Funil"}
              </Button>
              <Button size="lg" variant="outline" className="gap-2">
                <Lightning weight="regular" className="w-5 h-5" />
                Ver Simulador
              </Button>
            </div>
          </div>

          <Card className="bg-card/50 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-primary/20 text-primary font-bold px-4 py-2 rounded-lg">i95D</div>
                <span className="text-sm text-muted-foreground">9 INDICADORES / 5 DIMENSÕES</span>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50">
                  <Heart weight="duotone" className="w-5 h-5 text-primary" />
                  <div><span className="text-xs text-muted-foreground">1ª DIMENSÃO</span><p className="text-sm font-medium">Coração</p></div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50">
                  <Brain weight="duotone" className="w-5 h-5 text-primary" />
                  <div><span className="text-xs text-muted-foreground">2ª DIMENSÃO</span><p className="text-sm font-medium">Cabeça</p></div>
                </div>
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
                <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50">
                  <Wrench weight="duotone" className="w-5 h-5 text-primary" />
                  <div className="flex-1">
                    <span className="text-xs text-muted-foreground">4ª DIMENSÃO</span>
                    <p className="text-sm font-medium">Técnica</p>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded mt-1 inline-block">i5 Pacientes Finalizados</span>
                  </div>
                </div>
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

        <div className="text-center space-y-2">
          <h2 className="text-2xl md:text-3xl font-bold">Calcule Seu Funil Passo a Passo</h2>
          <p className="text-muted-foreground">Vamos construir seu entendimento sobre o método i95D</p>
        </div>

        {/* City Selection */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <MapPin weight="duotone" className="w-6 h-6 text-primary" />
              <div>
                <CardTitle>Sua Localização</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">A taxa de conversão varia conforme o tamanho da cidade</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <div className="flex-1">
                <Label htmlFor="city">Digite sua cidade</Label>
                <Input id="city" placeholder="Ex: Florianópolis" value={citySearch} onChange={(e) => { setCitySearch(e.target.value); setCityConfirmed(false); }} />
                {citySearch && !cityConfirmed && filteredCities.length > 0 && (
                  <div className="mt-2 bg-card border border-border rounded-lg overflow-hidden">
                    {filteredCities.slice(0, 5).map((city) => (
                      <button key={city.id} className="w-full px-4 py-2 text-left hover:bg-muted transition-colors flex justify-between items-center" onClick={() => { setSelectedCity(city); setCitySearch(`${city.name} - ${city.state}`); }}>
                        <span>{city.name} - {city.state}</span>
                        <span className="text-xs text-muted-foreground">{formatNumber(city.population)} hab.</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <Button className="mt-6 gap-2" disabled={!selectedCity} onClick={() => setCityConfirmed(true)}>
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
                      <p className="text-sm text-muted-foreground">{formatNumber(selectedCity.population)} habitantes • {selectedCity.classification.charAt(0).toUpperCase() + selectedCity.classification.slice(1)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Taxa Lead→Avaliação</p>
                      <p className="text-2xl font-bold text-primary">{(getCityConversionRate(selectedCity.classification) * 100).toFixed(0)}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>

        {/* Step 1: CPF */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">1</div>
              <CardTitle>Passo 1 - Calcule seu CPF</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label>Escolha sua Especialidade</Label>
              <Select value={selectedSpecialty} onValueChange={(val) => { setSelectedSpecialty(val); const s = specialties.find(sp => sp.id === val); if (s) setHoursPerTreatment(s.avgHours); }}>
                <SelectTrigger className="mt-2"><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {specialties.map((s) => (<SelectItem key={s.id} value={s.id}>{s.name} - {s.avgHours}h média</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Horas Disponíveis por Mês</Label>
                <Input type="number" value={hoursPerMonth} onChange={(e) => setHoursPerMonth(Number(e.target.value))} className="mt-2" />
              </div>
              <div>
                <Label>Horas para Finalizar 1 Tratamento</Label>
                <Input type="number" value={hoursPerTreatment} onChange={(e) => setHoursPerTreatment(Number(e.target.value))} className="mt-2" />
              </div>
            </div>
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <p className="font-mono text-sm">{hoursPerMonth}h ÷ {hoursPerTreatment}h = <span className="text-primary font-bold">{i5_cpf} pacientes</span></p>
                <div className="mt-4 bg-primary/20 border border-primary rounded-lg p-4 text-center">
                  <p className="text-xs text-muted-foreground mb-1">i5 (CPF)</p>
                  <p className="text-4xl font-bold text-primary">{i5_cpf}</p>
                </div>
              </CardContent>
            </Card>
          </CardContent>
        </Card>

        {/* Step 2: Ticket Médio */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">2</div>
                <CardTitle>Passo 2 - Ticket Médio</CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="useTable" className="text-sm">Usar Tabela</Label>
                <Switch id="useTable" checked={usePatientTable} onCheckedChange={setUsePatientTable} />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {usePatientTable ? (
              <>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Pacientes do Último Mês</p>
                  <div className="flex gap-2">
                    <Input placeholder="Nome" value={newPatientName} onChange={(e) => setNewPatientName(e.target.value)} className="w-32" />
                    <Input placeholder="Valor (R$)" type="number" value={newPatientValue} onChange={(e) => setNewPatientValue(e.target.value)} className="w-32" />
                    <Button onClick={addPatient} size="icon" variant="outline"><Plus weight="bold" className="w-4 h-4" /></Button>
                  </div>
                </div>
                <Table>
                  <TableHeader><TableRow><TableHead>Nome</TableHead><TableHead>Valor (R$)</TableHead><TableHead className="w-16">Ações</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {patients.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell>{p.name}</TableCell>
                        <TableCell>{formatCurrency(p.value)}</TableCell>
                        <TableCell><Button variant="ghost" size="icon" onClick={() => removePatient(p.id)}><Trash weight="regular" className="w-4 h-4 text-destructive" /></Button></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <Card className="bg-muted/50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Ticket Médio</span>
                      <span className="text-2xl font-bold text-primary">{formatCurrency(averageTicket)}</span>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <div>
                <Label>Ticket Médio (R$)</Label>
                <Input type="number" value={manualTicket} onChange={(e) => setManualTicket(Number(e.target.value))} className="mt-2" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Steps 3-5 */}
        <Card>
          <CardHeader><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">3</div><CardTitle>Fechamentos (i3)</CardTitle></div></CardHeader>
          <CardContent>
            <div className="bg-primary/20 border border-primary rounded-lg p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">i3 (Fechamentos)</p>
              <p className="text-4xl font-bold text-primary">{i3_fechamentos}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">4</div><CardTitle>Avaliações (i2)</CardTitle></div></CardHeader>
          <CardContent className="space-y-4">
            <Card className="bg-muted/50"><CardContent className="p-4"><p className="text-sm">Taxa: <span className="text-primary font-semibold">{(rateEvalToClose * 100).toFixed(0)}%</span> → i2 = {i3_fechamentos} ÷ {rateEvalToClose} = <span className="text-primary font-bold">{i2_avaliacoes}</span></p></CardContent></Card>
            <div className="bg-primary/20 border border-primary rounded-lg p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">i2 (Avaliações)</p>
              <p className="text-4xl font-bold text-primary">{i2_avaliacoes}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">5</div><CardTitle>Contatos (i1)</CardTitle></div></CardHeader>
          <CardContent className="space-y-4">
            <Card className="bg-muted/50"><CardContent className="p-4"><p className="text-sm">Taxa: <span className="text-primary font-semibold">{(rateLeadToEval * 100).toFixed(0)}%</span> → i1 = {i2_avaliacoes} ÷ {rateLeadToEval} = <span className="text-primary font-bold">{i1_contatos}</span></p></CardContent></Card>
            <div className="bg-primary/20 border border-primary rounded-lg p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">i1 (Contatos)</p>
              <p className="text-4xl font-bold text-primary">{i1_contatos}</p>
            </div>
          </CardContent>
        </Card>

        {/* Complete Funnel */}
        <Card className="border-primary/30">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Calculator weight="duotone" className="w-6 h-6 text-primary" />
              <CardTitle>Seu Funil Completo</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4 mb-8">
              <div className="text-center p-4 bg-muted rounded-lg"><UsersThree weight="duotone" className="w-6 h-6 mx-auto mb-2 text-primary" /><p className="text-2xl font-bold text-primary">{i1_contatos}</p><p className="text-xs text-muted-foreground">contatos</p></div>
              <CaretRight weight="bold" className="w-5 h-5 text-muted-foreground" />
              <div className="text-center p-4 bg-muted rounded-lg"><CalendarCheck weight="duotone" className="w-6 h-6 mx-auto mb-2 text-primary" /><p className="text-2xl font-bold text-primary">{i2_avaliacoes}</p><p className="text-xs text-muted-foreground">avaliações</p></div>
              <CaretRight weight="bold" className="w-5 h-5 text-muted-foreground" />
              <div className="text-center p-4 bg-muted rounded-lg"><Target weight="duotone" className="w-6 h-6 mx-auto mb-2 text-primary" /><p className="text-2xl font-bold text-primary">{i3_fechamentos}</p><p className="text-xs text-muted-foreground">fechamentos</p></div>
              <CaretRight weight="bold" className="w-5 h-5 text-muted-foreground" />
              <div className="text-center p-4 bg-muted rounded-lg"><CurrencyDollar weight="duotone" className="w-6 h-6 mx-auto mb-2 text-primary" /><p className="text-2xl font-bold text-primary">{formatCurrency(averageTicket)}</p><p className="text-xs text-muted-foreground">ticket médio</p></div>
              <CaretRight weight="bold" className="w-5 h-5 text-muted-foreground" />
              <div className="text-center p-4 bg-muted rounded-lg"><UserCheck weight="duotone" className="w-6 h-6 mx-auto mb-2 text-primary" /><p className="text-2xl font-bold text-primary">{i5_cpf}</p><p className="text-xs text-muted-foreground">CPF</p></div>
            </div>
            <Card className="bg-gradient-to-r from-primary/20 to-primary/5 border-primary/30">
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <TrendUp weight="bold" className="w-6 h-6 text-primary" />
                  <span className="text-sm text-muted-foreground">Faturamento Mensal Projetado</span>
                </div>
                <p className="text-4xl md:text-5xl font-bold text-foreground">{formatCurrency(monthlyRevenue)}</p>
              </CardContent>
            </Card>
          </CardContent>
        </Card>

        {/* Simulator */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Lightning weight="duotone" className="w-6 h-6 text-primary" />
              <CardTitle>E Se Você Melhorasse Apenas...</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center"><Label>Lead → Comparecimento</Label><span className="text-primary font-semibold">{simLeadToEval}%</span></div>
              <Slider value={[simLeadToEval]} onValueChange={(val) => setSimLeadToEval(val[0])} min={10} max={70} step={5} />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center"><Label>Comparecimento → Fechamento</Label><span className="text-primary font-semibold">{simEvalToClose}%</span></div>
              <Slider value={[simEvalToClose]} onValueChange={(val) => setSimEvalToClose(val[0])} min={10} max={70} step={5} />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center"><Label>Ticket Médio</Label><span className="text-primary font-semibold">{formatCurrency(simTicket)}</span></div>
              <Slider value={[simTicket]} onValueChange={(val) => setSimTicket(val[0])} min={1000} max={50000} step={500} />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <Card className="bg-muted/50">
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-4">Atual</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Faturamento</span><span className="font-semibold">{formatCurrency(monthlyRevenue)}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Contatos</span><span>{i1_contatos}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Avaliações</span><span>{i2_avaliacoes}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Fechamentos</span><span>{i3_fechamentos}</span></div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-primary/10 border-primary/30">
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-4 text-primary">Simulado</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Faturamento</span><span className="font-semibold text-green-500">{formatCurrency(simulated.revenue)}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Contatos</span><span>{simulated.i1}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Avaliações</span><span>{simulated.i2}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Fechamentos</span><span>{simulated.i3}</span></div>
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

        {/* Save Button */}
        <div className="flex flex-wrap gap-4 justify-center">
          <Button size="lg" className="gap-2" onClick={saveFunnel} disabled={saving}>
            {saving ? <CircleNotch weight="bold" className="w-5 h-5 animate-spin" /> : <FloppyDisk weight="bold" className="w-5 h-5" />}
            {saving ? "Salvando..." : "Salvar Meu Funil"}
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
