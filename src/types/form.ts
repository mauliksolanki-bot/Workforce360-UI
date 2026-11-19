/**
 * Data contracts for the generic form-field-definition system
 * (`NXTGEN_FORM_MASTER` / `NXTGEN_FORM_FIELDS_MASTER`), served by
 * `GET /form/getformdetails?formCode=...`.
 */
export interface NxtGenFormField {
    id: number;
    fieldCode: string;
    fieldName: string;
    fieldType: string;
    isMandatory: 'Y' | 'N';
}
