import { 
  Upload, 
  ScanText, 
  CheckCircle, 
  HardDrive, 
  Link2, 
  BadgeCheck, 
  ArrowLeftRight 
} from "lucide-react"

const steps = [
  { icon: Upload, label: "Upload Document" },
  { icon: ScanText, label: "OCR Extract" },
  { icon: CheckCircle, label: "Confirm Data" },
  { icon: HardDrive, label: "Store on IPFS" },
  { icon: Link2, label: "Register on Blockchain" },
  { icon: BadgeCheck, label: "Authority Verification" },
  { icon: ArrowLeftRight, label: "Transfer Ownership" },
]

export function WorkflowSection() {
  return (
    <section className="relative py-24">
      <div className="mx-auto max-w-7xl px-4">
        {/* Section Header */}
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Simple Registration Workflow
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            From document upload to ownership transfer in seven streamlined steps.
          </p>
        </div>

        {/* Stepper */}
        <div className="relative">
          {/* Connecting Line - Desktop */}
          <div className="absolute top-6 left-0 right-0 hidden h-px bg-gradient-to-r from-transparent via-border to-transparent lg:block" />
          
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-7">
            {steps.map((step, index) => (
              <div key={step.label} className="relative flex flex-col items-center text-center">
                {/* Step Number */}
                <div className="relative mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-card">
                    <step.icon className="h-5 w-5" />
                  </div>
                  <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-foreground text-xs font-medium text-background">
                    {index + 1}
                  </span>
                </div>
                
                {/* Label */}
                <p className="text-xs font-medium leading-tight sm:text-sm">{step.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
