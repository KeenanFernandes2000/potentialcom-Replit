export function CrmHoneypot({ campaign }: { campaign: string }) {
  return (
    <div aria-hidden="true" className="absolute -left-[10000px] h-px w-px overflow-hidden">
      <label>
        Leave this field empty
        <input name="hp" data-crm-form={campaign} type="text" tabIndex={-1} autoComplete="off" />
      </label>
    </div>
  );
}
