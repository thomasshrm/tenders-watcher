import { api } from "@/lib/api";
import { useState, useEffect } from "react";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/features/auth/auth-context";
import {
  MultiSelect,
  MultiSelectContent,
  MultiSelectGroup,
  MultiSelectItem,
  MultiSelectTrigger,
  MultiSelectValue,
} from "@/components/ui/multi-select";

const schemaDescripteur = z.object({
  codes: z.array(z.string()).min(1, "Sélectionnez au moins un descripteur"),
});

type Descripteur = { code: string; libelle: string };
type FormInputDescripteur = z.infer<typeof schemaDescripteur>;

export default function PersonalPreferencesPanel() {
    const [descripteurs, setDescripteurs] = useState<Descripteur[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth() as any;

    const formDescripteur = useForm<FormInputDescripteur>({
        resolver: zodResolver(schemaDescripteur),
        defaultValues: { codes: [] },
        mode: "onSubmit",
        reValidateMode: "onChange",
    });

    const fetchDescripteurs = async () => {
        try {
        setLoading(true);
        setError(null);
        const { data } = await api.get("/api/descripteurs");
        setDescripteurs(data);
        } catch (e: any) {
        setError(e?.message ?? "Erreur inconnue");
        } finally {
        setLoading(false);
        }
    };

    const fetchUserDescripteurs = async () => {
        try {
        setLoading(true);
        setError(null);
        const { data } = await api.get("/api/user_descripteurs");
        const codes: string[] = String(data?.[0]?.codes ?? "")
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
        formDescripteur.reset({ codes });
        } catch (e: any) {
        setError(e?.message ?? "Erreur inconnue");
        } finally {
        setLoading(false);
        }
    };

    useEffect(() => {
        if (!user) return;
        fetchDescripteurs();
        fetchUserDescripteurs();
    }, [user]);

    async function onSubmitDescripteur(values: FormInputDescripteur) {
        try {
        setLoading(true);
        setError(null);
        const payload = { codes: values.codes.join(",") };
        console.log("SUBMIT payload:", payload);
        await api.post(`/api/descripteurs`, payload);
        } catch (e: any) {
        setError(e?.message ?? "Unknown error");
        } finally {
        setLoading(false);
        }
    }

    return (
        <div className="space-y-2">
        <p className="text-base font-semibold text-neutral-400">
            Gérer vos préférences personnelles.
        </p>
        <br />
        <Form {...formDescripteur}>
            <form
            className="space-y-4"
            onSubmit={formDescripteur.handleSubmit(onSubmitDescripteur)}
            >
            <FormField
                control={formDescripteur.control}
                name="codes"
                render={({ field }) => (
                <MultiSelect
                    values={field.value ?? []}
                    onValuesChange={field.onChange}
                >
                    <MultiSelectTrigger className="w-full max-w-[400px]">
                    <MultiSelectValue placeholder="Sélectionner vos marchés préférés..." />
                    </MultiSelectTrigger>
                    <MultiSelectContent>
                    <MultiSelectGroup>
                        {loading && (
                        <MultiSelectItem key="load" value="load" disabled>
                            Chargement en cours
                        </MultiSelectItem>
                        )}
                        {error && (
                        <MultiSelectItem key="err" value="err" disabled>
                            Erreur lors du chargement
                        </MultiSelectItem>
                        )}
                        {!loading &&
                        !error &&
                        descripteurs.map((d) => (
                            <MultiSelectItem key={d.code} value={d.code}>
                            {d.libelle}
                            </MultiSelectItem>
                        ))}
                    </MultiSelectGroup>
                    </MultiSelectContent>
                </MultiSelect>
                )}
            />

            <Button type="submit" variant="secondary" disabled={loading}>
                {loading ? (
                <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Enregistrement…
                </>
                ) : (
                "Enregistrer"
                )}
            </Button>
            </form>
        </Form>
        </div>
    );
}
