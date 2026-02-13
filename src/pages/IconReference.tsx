import { AppLayout } from "@/components/layout/AppLayout";
import {
  Trophy,
  Crown,
  Medal,
  Fire,
  FileText,
  VideoCamera,
  ChatCircle,
  Target,
  CheckCircle,
  CaretUp,
  CaretDown,
  Minus,
  Lock,
  Calendar,
  CalendarCheck,
  Lightning,
  Rocket,
  FilmSlate,
  FilmStrip,
  MagnifyingGlass,
  Eye,
  Eyeglasses,
  GraduationCap,
  Sparkle,
  WarningCircle,
  TrendUp,
  Footprints,
  House,
  Microphone,
  ChartLine,
  InstagramLogo,
  User,
  Gear,
  Users,
  SignOut,
  Play,
  Pause,
  Stop,
  ArrowLeft,
  ArrowRight,
  Plus,
  X,
  Check,
  Info,
  Question,
  Bell,
  Envelope,
  Phone,
  MapPin,
  Heart,
  Star,
  Bookmark,
  Share,
  Download,
  Upload,
  Trash,
  PencilSimple,
  Copy,
  Link,
  Image,
  Camera,
  Folder,
  File,
  Clock,
  CalendarBlank,
} from "@phosphor-icons/react";

const weights = ["thin", "light", "regular", "bold", "fill", "duotone"] as const;

const iconGroups = [
  {
    name: "Ranking & Gamificação",
    icons: [
      { component: Trophy, name: "Trophy" },
      { component: Crown, name: "Crown" },
      { component: Medal, name: "Medal" },
      { component: Fire, name: "Fire" },
      { component: Star, name: "Star" },
      { component: TrendUp, name: "TrendUp" },
    ],
  },
  {
    name: "Navegação",
    icons: [
      { component: House, name: "House" },
      { component: User, name: "User" },
      { component: Users, name: "Users" },
      { component: Gear, name: "Gear" },
      { component: SignOut, name: "SignOut" },
      { component: Bell, name: "Bell" },
    ],
  },
  {
    name: "Módulos do App",
    icons: [
      { component: FileText, name: "FileText" },
      { component: VideoCamera, name: "VideoCamera" },
      { component: ChatCircle, name: "ChatCircle" },
      { component: Target, name: "Target" },
      { component: Microphone, name: "Microphone" },
      { component: ChartLine, name: "ChartLine" },
      { component: InstagramLogo, name: "InstagramLogo" },
    ],
  },
  {
    name: "Badges & Conquistas",
    icons: [
      { component: Footprints, name: "Footprints" },
      { component: Calendar, name: "Calendar" },
      { component: CalendarCheck, name: "CalendarCheck" },
      { component: Lightning, name: "Lightning" },
      { component: Rocket, name: "Rocket" },
      { component: FilmSlate, name: "FilmSlate" },
      { component: FilmStrip, name: "FilmStrip" },
      { component: MagnifyingGlass, name: "MagnifyingGlass" },
      { component: Eye, name: "Eye" },
      { component: Eyeglasses, name: "Eyeglasses" },
      { component: GraduationCap, name: "GraduationCap" },
    ],
  },
  {
    name: "Estados & Feedback",
    icons: [
      { component: CheckCircle, name: "CheckCircle" },
      { component: WarningCircle, name: "WarningCircle" },
      { component: Info, name: "Info" },
      { component: Question, name: "Question" },
      { component: Lock, name: "Lock" },
      { component: Sparkle, name: "Sparkle" },
    ],
  },
  {
    name: "Direção & Variação",
    icons: [
      { component: CaretUp, name: "CaretUp" },
      { component: CaretDown, name: "CaretDown" },
      { component: Minus, name: "Minus" },
      { component: ArrowLeft, name: "ArrowLeft" },
      { component: ArrowRight, name: "ArrowRight" },
    ],
  },
  {
    name: "Ações",
    icons: [
      { component: Play, name: "Play" },
      { component: Pause, name: "Pause" },
      { component: Stop, name: "Stop" },
      { component: Plus, name: "Plus" },
      { component: X, name: "X" },
      { component: Check, name: "Check" },
      { component: PencilSimple, name: "PencilSimple" },
      { component: Trash, name: "Trash" },
      { component: Copy, name: "Copy" },
      { component: Download, name: "Download" },
      { component: Upload, name: "Upload" },
      { component: Share, name: "Share" },
    ],
  },
  {
    name: "Contato & Comunicação",
    icons: [
      { component: Envelope, name: "Envelope" },
      { component: Phone, name: "Phone" },
      { component: MapPin, name: "MapPin" },
      { component: Link, name: "Link" },
    ],
  },
  {
    name: "Mídia & Arquivos",
    icons: [
      { component: Image, name: "Image" },
      { component: Camera, name: "Camera" },
      { component: Folder, name: "Folder" },
      { component: File, name: "File" },
      { component: Clock, name: "Clock" },
      { component: CalendarBlank, name: "CalendarBlank" },
      { component: Heart, name: "Heart" },
      { component: Bookmark, name: "Bookmark" },
    ],
  },
];

const weightDescriptions = {
  thin: { label: "Thin", usage: "Elementos muito sutis", color: "#6B7280" },
  light: { label: "Light", usage: "Navegação inativa, labels secundários", color: "#9CA3AF" },
  regular: { label: "Regular", usage: "Uso geral, navegação ativa", color: "#FFFFFF" },
  bold: { label: "Bold", usage: "CTAs, botões de destaque", color: "#FFFFFF" },
  fill: { label: "Fill", usage: "Estados ativos, badges conquistados", color: "#00A0CC" },
  duotone: { label: "Duotone", usage: "Cards premium, features principais", color: "#00A0CC" },
};

export default function IconReference() {
  return (
    <AppLayout>
      <div className="p-6 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Referência de Ícones Phosphor
          </h1>
          <p className="text-muted-foreground mt-1">
            Biblioteca de ícones utilizada no Código de Poder
          </p>
        </div>

        {/* Weight Guide */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-lg font-medium text-foreground mb-4">Guia de Pesos</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {weights.map((weight) => (
              <div
                key={weight}
                className="bg-background/50 rounded-lg p-4 text-center space-y-2"
              >
                <Trophy
                  size={32}
                  weight={weight}
                  color={weightDescriptions[weight].color}
                />
                <p className="font-medium text-foreground text-sm">
                  {weightDescriptions[weight].label}
                </p>
                <p className="text-xs text-muted-foreground">
                  {weightDescriptions[weight].usage}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Icon Groups */}
        {iconGroups.map((group) => (
          <div key={group.name} className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg font-medium text-foreground mb-4">{group.name}</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-2 text-sm text-muted-foreground font-medium">
                      Nome
                    </th>
                    {weights.map((weight) => (
                      <th
                        key={weight}
                        className="text-center py-3 px-2 text-sm text-muted-foreground font-medium"
                      >
                        {weight}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {group.icons.map(({ component: Icon, name }) => (
                    <tr key={name} className="border-b border-border/50 hover:bg-background/30">
                      <td className="py-3 px-2">
                        <code className="text-xs text-primary bg-primary/10 px-2 py-1 rounded">
                          {name}
                        </code>
                      </td>
                      {weights.map((weight) => (
                        <td key={weight} className="text-center py-3 px-2">
                          <Icon
                            size={24}
                            weight={weight}
                            className="inline-block text-foreground"
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}

        {/* Usage Examples */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-lg font-medium text-foreground mb-4">Exemplos de Uso</h2>
          <div className="space-y-4">
            <div className="bg-background/50 rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-2">Importação:</p>
              <code className="text-xs text-primary block bg-background p-3 rounded">
                {`import { Trophy, Crown, Medal } from '@phosphor-icons/react';`}
              </code>
            </div>
            <div className="bg-background/50 rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-2">Componente com peso:</p>
              <code className="text-xs text-primary block bg-background p-3 rounded">
                {`<Trophy size={32} weight="fill" className="text-primary" />`}
              </code>
            </div>
            <div className="bg-background/50 rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-2">Cor personalizada:</p>
              <code className="text-xs text-primary block bg-background p-3 rounded">
                {`<Crown size={24} weight="fill" color="#FFD700" />`}
              </code>
            </div>
          </div>
        </div>

        {/* Quick Reference */}
        <div className="bg-primary/10 border border-primary/20 rounded-xl p-6">
          <h2 className="text-lg font-medium text-foreground mb-4 flex items-center gap-2">
            <Info size={20} weight="fill" className="text-primary" />
            Referência Rápida
          </h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <CheckCircle size={16} weight="fill" className="text-green-500" />
              <span><strong>light</strong> → Navegação inativa (#9CA3AF)</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle size={16} weight="fill" className="text-green-500" />
              <span><strong>regular</strong> → Uso geral (#FFFFFF ou #00A0CC)</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle size={16} weight="fill" className="text-green-500" />
              <span><strong>bold</strong> → CTAs e botões (#FFFFFF)</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle size={16} weight="fill" className="text-green-500" />
              <span><strong>duotone</strong> → Cards premium (#00A0CC)</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle size={16} weight="fill" className="text-green-500" />
              <span><strong>fill</strong> → Estados ativos, badges (#00A0CC)</span>
            </li>
          </ul>
        </div>
      </div>
    </AppLayout>
  );
}
