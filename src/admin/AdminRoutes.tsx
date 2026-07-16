import { Route, Routes } from "react-router-dom";
import { Seo } from "@/components/seo/Seo";

/** Adminpanelet bygges i Fase 4. Ruterne er reserveret og noindex'et fra start. */
export default function AdminRoutes() {
  return (
    <>
      <Seo title="Admin" index={false} />
      <Routes>
        <Route
          path="*"
          element={
            <div className="flex min-h-screen items-center justify-center bg-brand-surface p-8 text-center">
              <div>
                <h1 className="font-display text-2xl font-bold text-brand-primary">Adminpanel</h1>
                <p className="mt-2 text-brand-ink/70">Bygges i Fase 4 (bil-CRUD, lead-CRM, roller og indstillinger).</p>
              </div>
            </div>
          }
        />
      </Routes>
    </>
  );
}
