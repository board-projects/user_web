import { DesignWorkspace } from "@/features/design/ui/DesignWorkspace";

export default function BoardDesignPage({ params }: { params: { reference: string } }) {
  return <DesignWorkspace key={params.reference} reference={params.reference} />;
}
