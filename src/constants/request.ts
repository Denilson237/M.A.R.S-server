export const sqlQuery = {

	/*------------------------------------------------
	 *       CMS BILLS QUERY
	------------------------------------------------ */
	bills_by_invoice_number:
		`select /*+ parallel(6) */
			s.regroup_id code_regroupement,
			decode(r.nis_rad, 0, r.cod_cta_pago, r.nis_rad) numero_contrat,
			r.num_rec numero_facture,
			s.cust_name nom_client,
			to_char(r.f_prev_puesta,'dd/mm/yyyy') date_facturation,
			ceil(imp_tot_rec-imp_cta) montant_impaye,
			s.est_serv status_client
		from cmsadmin.recibos r
			left join cmsreport.tb_customers_infos s on r.nis_rad = s.nis_rad and regexp_like(s.est_serv,'EC0(1[1-4]|2[08])')
		where /*r.num_rec in (424378539) or*/ (r.num_rec = :BillNber
        and regexp_like(r.tip_rec, 'TR0([1-6]0|12|21|22)')
        and ((r.est_act in (select est_rec from cmsadmin.grupo_est where co_grupo = 'GE114')
                and regexp_like(s.est_serv,'EC0(1[1-4]|28)'))
            or (r.est_act = 'ER240' and s.est_serv = 'EC020')
            or r.nis_rad = 0))`,


	/*------------------------------------------------
	 *       CMS UNPAID QUERY
	------------------------------------------------ */
	unpaid_bills_by_contract_number:
		`/* The above TypeScript code is a SQL query that retrieves specific data from the database based on
		certain conditions. Here is a breakdown of what the code is doing: */
		select /*+ parallel(4) */
        doc_id code_regroupement,
        r.nis_rad numero_contrat,
        r.num_rec numero_facture,
        (select regexp_replace(regexp_replace(c.ape1_cli,'[\+\*\$!%,?\.;^¨§]*') || ' ' ||
        regexp_replace(c.nom_cli,'[\+\*\$!%,?\.;^¨§]*') || ' ' ||
        regexp_replace(c.ape2_cli,'[\+\*\$!%,?\.;^¨§]*'), '^[[:blank:][:space:]''\+\*\$!%,?\.;^¨§-]*|[[:blank:][:space:]''\+\*\$!%,?\./;^¨§-]*$')
        from cmsadmin.clientes c join cmsadmin.sumcon s on c.cod_cli = s.cod_cli where s.nis_rad = r.nis_rad) nom_client,
        to_char(r.f_prev_puesta,'dd/mm/yyyy') date_facturation,
        ceil(imp_tot_rec-imp_cta) montant_impaye,
		ceil(imp_tot_rec-imp_cta) montant_apaye,
		s.est_serv status_client
    from cmsadmin.recibos r left join cmsadmin.xclientes x on r.nis_rad = x.nis_rad
        join cmsadmin.sumcon s on r.nis_rad = s.nis_rad and regexp_like(s.est_serv,'EC0(1[1-4]|2[08])')
    where r.nis_rad = :ContractNber
        and r.f_prev_puesta between to_date(:FromDate, 'dd/mm/yyyy') and to_date(:ToDate, 'dd/mm/yyyy')
        and imp_tot_rec - imp_cta > 0
        and regexp_like(tip_rec, 'TR0([1-6]0|12|21|22)')
        and ((r.est_act in (select est_rec from cmsadmin.grupo_est where co_grupo = 'GE114')
                and regexp_like(s.est_serv,'EC0(1[1-4]|28)'))
            or (r.est_act = 'ER240' and s.est_serv = 'EC020'))
    order by f_prev_puesta desc`,

	unpaid_bills_by_invoice_number:
		`select /*+ parallel(6) */
        s.regroup_id code_regroupement,
        decode(r.nis_rad, 0, r.cod_cta_pago, r.nis_rad) numero_contrat,
        r.num_rec numero_facture,
        s.cust_name nom_client,
        to_char(r.f_prev_puesta,'dd/mm/yyyy') date_facturation,
        ceil(imp_tot_rec-imp_cta) montant_impaye,
		ceil(imp_tot_rec-imp_cta) montant_apaye,
		s.est_serv status_client
    from cmsadmin.recibos r
        left join cmsreport.tb_customers_infos s on r.nis_rad = s.nis_rad and regexp_like(s.est_serv,'EC0(1[1-4]|2[08])')
    where /*r.num_rec in (424378539) or*/ (r.num_rec = :BillNber
        and r.imp_tot_rec - r.imp_cta > 0
        and regexp_like(r.tip_rec, 'TR0([1-6]0|12|21|22)')
        and ((r.est_act in (select est_rec from cmsadmin.grupo_est where co_grupo = 'GE114')
                and regexp_like(s.est_serv,'EC0(1[1-4]|28)'))
            or (r.est_act = 'ER240' and s.est_serv = 'EC020')
            or r.nis_rad = 0))`,

	unpaid_bills_by_customer_regroup_number:
		`with regroupCusts as (select /*+ parallel(2) */ doc_id, nis_rad from cmsadmin.xclientes x where x.doc_id = :RegroupCode)
		select /*+ parallel(4) */
			doc_id code_regroupement,
			r.nis_rad numero_contrat,
			r.num_rec numero_facture,
			(select regexp_replace(regexp_replace(c.ape1_cli,'[\+\*\$!%,?\.;^¨§]*') || ' ' ||
			regexp_replace(c.nom_cli,'[\+\*\$!%,?\.;^¨§]*') || ' ' ||
			regexp_replace(c.ape2_cli,'[\+\*\$!%,?\.;^¨§]*'), '^[[:blank:][:space:]''\+\*\$!%,?\.;^¨§-]*|[[:blank:][:space:]''\+\*\$!%,?\./;^¨§-]*$')
			from cmsadmin.clientes c join cmsadmin.sumcon s on c.cod_cli = s.cod_cli where s.nis_rad = r.nis_rad) nom_client,
			to_char(r.f_prev_puesta,'dd/mm/yyyy') date_facturation,
			ceil(imp_tot_rec-imp_cta) montant_impaye,
			ceil(imp_tot_rec-imp_cta) montant_apaye,
			s.est_serv status_client
		from cmsadmin.recibos r join regroupCusts x on r.nis_rad = x.nis_rad
			join cmsadmin.sumcon s on r.nis_rad = s.nis_rad and regexp_like(s.est_serv,'EC0(1[1-4]|2[08])')
		where imp_tot_rec - imp_cta > 0
			and r.f_prev_puesta between to_date(:FromDate, 'dd/mm/yyyy') and to_date(:ToDate, 'dd/mm/yyyy')
			and regexp_like(tip_rec, 'TR0([1-6]0|12|21|22)')
			and ((r.est_act in (select est_rec from cmsadmin.grupo_est where co_grupo = 'GE114')
					and regexp_like(s.est_serv,'EC0(1[1-4]|28)'))
				or (r.est_act = 'ER240' and s.est_serv = 'EC020'))
		order by f_prev_puesta desc`,

	unpaid_bills_by_customer_name:
		`with tb_sdgc_groupes as (select /*+ parallel(2) */ groupe, service_no from cmsadmin.sdgc_groupes x where groupe = :CustomerName)
		select /*+ parallel(4) */
			groupe code_regroupement,
			r.nis_rad numero_contrat,
			r.num_rec numero_facture,
			(select regexp_replace(regexp_replace(c.ape1_cli,'[\+\*\$!%,?\.;^¨§]*') || ' ' || regexp_replace(c.nom_cli,'[\+\*\$!%,?\.;^¨§]*') || ' ' ||
				regexp_replace(c.ape2_cli,'[\+\*\$!%,?\.;^¨§]*'), '^[[:blank:][:space:]''\+\*\$!%,?\.;^¨§-]*|[[:blank:][:space:]''\+\*\$!%,?\./;^¨§-]*$')
				from cmsadmin.clientes c join cmsadmin.sumcon s on c.cod_cli = s.cod_cli where s.nis_rad = r.nis_rad) nom_client,
			to_char(r.f_prev_puesta,'dd/mm/yyyy') date_facturation,
			ceil(imp_tot_rec-imp_cta) montant_impaye,
			ceil(imp_tot_rec-imp_cta) montant_apaye
		from cmsadmin.recibos r join tb_sdgc_groupes x on r.nis_rad = x.service_no
			join cmsadmin.sumcon s on r.nis_rad = s.nis_rad and regexp_like(s.est_serv,'EC0(1[1-4]|2[08])')
		where imp_tot_rec - imp_cta > 0
			and r.f_prev_puesta between to_date(:FromDate, 'dd/mm/yyyy') and to_date(:ToDate, 'dd/mm/yyyy')
			and regexp_like(tip_rec, 'TR0([1-6]0|12|21|22)')
			and ((r.est_act in (select est_rec from cmsadmin.grupo_est where co_grupo = 'GE114')
					and regexp_like(s.est_serv,'EC0(1[1-4]|28)'))
				or (r.est_act = 'ER240' and s.est_serv = 'EC020'))
			order by f_prev_puesta desc`,

	unpaid_bills_on_list:
		`select /*+ parallel(8) */ distinct
			(select distinct s.groupe from cmsadmin.sdgc_groupes s where s.service_no = b.nis_rad) code_regroupement,
			b.nis_rad numero_contrat,
			b.num_rec numero_facture,
			(select regexp_replace(regexp_replace(regexp_replace(c.ape1_cli || ' ' || c.nom_cli || ' ' || c.ape2_cli,'[\+\*\$!%,?;^¨§]*'),
				'^[[:blank:][:space:]''\+\*\$!%,?;^¨§-]*|[[:blank:][:space:]''\+\*\$!%,?/;^¨§-]*$'),'[[:blank:][:space:]]{2,}', ' ')
				from cmsadmin.clientes c where c.cod_cli = s.cod_cli) nom_client,
			to_char(c.f_prev_puesta,'dd/mm/yyyy') date_facturation,
			b.paid_amount montant_paye,
			nvl(c.imp_tot_rec-c.imp_cta, 0) montant_impaye,
			(case  /*-- L'ordre des Tests ci-dessous est HYPER Important !!! --*/
				when s.nis_rad is null and r.num_rec is null then 'BAD SERVICE &amp; BAD BILL'
				when s.nis_rad is null then 'BAD SERVICE'
				when r.num_rec is null then 'BAD BILL'
				when c.num_rec is null then 'BAD LINK'
				when c.imp_tot_rec - c.imp_cta &lt;= 0 then 'PAID'
				when not regexp_like(r.tip_rec, 'TR0([1-6]0|12|21|22)') then 'INCORRECT BILL TYPE'
				when regexp_like(s.est_serv,'EC0(1[1-4]|28)') and c.est_act not in (select 'ER315' from dual union select g.est_rec from cmsadmin.grupo_est g where g.co_grupo = 'GE114') then 'INCORRECT BILL STATUS'
				when s.est_serv = 'EC020' and c.est_act = 'ER240' then 'OK'
				when not regexp_like(s.est_serv,'EC0(1[1-4]|28)') and c.est_act in (select g.est_rec from cmsadmin.grupo_est g where g.co_grupo = 'GE114') then 'INCORRECT SERVICE STATUS'
				when s.est_serv = 'EC020' and c.est_act &lt;&gt; 'ER240' then 'INACTIVE SERVICE'
				else 'OK'
			end) result
		from bills_to_pay b
			left join cmsadmin.sumcon s on b.nis_rad = s.nis_rad
			left join cmsadmin.recibos r on b.num_rec = r.num_rec
			left join cmsadmin.recibos c on b.num_rec = c.num_rec and b.nis_rad = c.nis_rad
		where b.nis_rad &lt;&gt; 0
			and b.num_rec &lt;&gt; 0
			and r.tip_rec != 'TR060'
		union
		select /*+ parallel(8) */ distinct
			(select distinct s.groupe from cmsadmin.sdgc_groupes s where s.service_no = b.nis_rad) code_regroupement,
			b.nis_rad numero_contrat,
			b.num_rec numero_facture,
			(select regexp_replace(regexp_replace(regexp_replace(c.ape1_cli || ' ' || c.nom_cli || ' ' || c.ape2_cli,'[\+\*\$!%,?;^¨§]*'),
				'^[[:blank:][:space:]''\+\*\$!%,?;^¨§-]*|[[:blank:][:space:]''\+\*\$!%,?/;^¨§-]*$'),'[[:blank:][:space:]]{2,}', ' ')
				from cmsadmin.clientes c where c.cod_cli = s.cod_cli) nom_client,
			to_char(r.f_prev_puesta,'dd/mm/yyyy') date_facturation,
			b.paid_amount montant_paye,
			nvl(r.imp_tot_rec-r.imp_cta, 0) montant_impaye,
			(case  /*-- L'ordre des Tests ci-dessous est HYPER Important !!! --*/
				when s.nis_rad is null and r.num_rec is null then 'BAD SERVICE - BAD BILL'
				when s.nis_rad is null then 'BAD SERVICE'
				when cu.num_rec_cuota is null then 'BAD BILL'
				when m.num_rec is null then 'BAD LINK'
				when sb.nis_rad is null or b.nis_rad != sb.nis_rad then 'BAD LINK'
				when r.imp_tot_rec - r.imp_cta &lt;= 0 then 'PAID'
				when r.tip_rec &lt;&gt; 'TR060' then 'INCORRECT BILL TYPE'
				when regexp_like(s.est_serv,'EC0(1[1-4]|28)') and r.est_act not in (select 'ER315' from dual union select g.est_rec from cmsadmin.grupo_est g where g.co_grupo = 'GE114') then 'INCORRECT BILL STATUS'
				when s.est_serv = 'EC020' and r.est_act = 'ER240' then 'OK'
				when not regexp_like(s.est_serv,'EC0(1[1-4]|28)') and r.est_act in (select g.est_rec from cmsadmin.grupo_est g where g.co_grupo = 'GE114') then 'INCORRECT SERVICE STATUS'
				when s.est_serv = 'EC020' and (r.est_act &lt;&gt; 'ER240' or sb.est_act &lt;&gt; 'ER240') then 'INACTIVE SERVICE'
				else 'OK'
			end) result
		from bills_to_pay b
			join cmsadmin.recibos r on b.num_rec = r.num_rec
			join cmsadmin.cuotas cu on b.num_rec = cu.num_rec_cuota
			join cmsadmin.macuerdos_rec m on cu.id_acuerdo = m.id_acuerdo
			join cmsadmin.recibos sb on m.num_rec = sb.num_rec
			join cmsadmin.sumcon s on sb.nis_rad = s.nis_rad
		where b.nis_rad &lt;&gt; 0
			and b.num_rec &lt;&gt; 0
			and r.tip_rec = 'TR060' 
    `,

	unpaid_bills_on_list_with_account:
		`select /*+ parallel(8) */ distinct
			(select distinct s.groupe from cmsadmin.sdgc_groupes s where s.service_no = b.nis_rad) code_regroupement,
			b.nis_rad numero_contrat,
			b.num_rec numero_facture,
			(select regexp_replace(regexp_replace(regexp_replace(c.ape1_cli || ' ' || c.nom_cli || ' ' || c.ape2_cli,'[\+\*\$!%,?;^¨§]*'),
				'^[[:blank:][:space:]''\+\*\$!%,?;^¨§-]*|[[:blank:][:space:]''\+\*\$!%,?/;^¨§-]*$'),'[[:blank:][:space:]]{2,}', ' ')
				from cmsadmin.clientes c where c.cod_cli = s.cod_cli) nom_client,
			to_char(c.f_prev_puesta,'dd/mm/yyyy') date_facturation,
			b.paid_amount montant_paye,
			nvl(c.imp_tot_rec-c.imp_cta, 0) montant_impaye,
			(case  /*-- L'ordre des Tests ci-dessous est HYPER Important !!! --*/
				when s.nis_rad is null and r.num_rec is null then 'BAD SERVICE &amp; BAD BILL'
				when s.nis_rad is null then 'BAD SERVICE'
				when r.num_rec is null then 'BAD BILL'
				when c.num_rec is null then 'BAD LINK'
				when c.imp_tot_rec - c.imp_cta &lt;= 0 then 'PAID'
				when not regexp_like(r.tip_rec, 'TR0([1-6]0|12|21|22)') then 'INCORRECT BILL TYPE'
				when regexp_like(s.est_serv,'EC0(1[1-4]|28)') and c.est_act not in (select 'ER315' from dual union select g.est_rec from cmsadmin.grupo_est g where g.co_grupo = 'GE114') then 'INCORRECT BILL STATUS'
				when s.est_serv = 'EC020' and c.est_act = 'ER240' then 'OK'
				when not regexp_like(s.est_serv,'EC0(1[1-4]|28)') and c.est_act in (select g.est_rec from cmsadmin.grupo_est g where g.co_grupo = 'GE114') then 'INCORRECT SERVICE STATUS'
				when s.est_serv = 'EC020' and c.est_act &lt;&gt; 'ER240' then 'INACTIVE SERVICE'
				else 'OK'
			end) result
		from bills_to_pay b
			left join cmsadmin.sumcon s on b.nis_rad = s.nis_rad
			left join cmsadmin.recibos r on b.num_rec = r.num_rec
			left join cmsadmin.recibos c on b.num_rec = c.num_rec and b.nis_rad = c.nis_rad
		where b.nis_rad &lt;&gt; 0
			and b.num_rec &lt;&gt; 0
		union
		select /*+ parallel(8) */ distinct
			'' code_regroupement,
			c.cod_cta_pago numero_contrat,
			b.num_rec numero_facture,
			(select regexp_replace(regexp_replace(regexp_replace(c.ape1_cli || ' ' || c.nom_cli || ' ' || c.ape2_cli,'[\+\*\$!%,?;^¨§]*'),
				'^[[:blank:][:space:]''\+\*\$!%,?;^¨§-]*|[[:blank:][:space:]''\+\*\$!%,?/;^¨§-]*$'),'[[:blank:][:space:]]{2,}', ' ')
				from cmsadmin.clientes c join cmsadmin.expedientes e on c.cod_cli = e.cod_cli_s where e.num_exp = r.num_fact) nom_client,
			to_char(c.f_prev_puesta,'dd/mm/yyyy') date_facturation,
			b.paid_amount montant_paye,
			nvl(c.imp_tot_rec-c.imp_cta, 0) montant_impaye,
			(case  /*-- L'ordre des Tests ci-dessous est HYPER Important !!! --*/
				when r.num_rec is null then 'BAD BILL'
				when c.num_rec is null then 'BAD LINK'
				when c.imp_tot_rec - c.imp_cta &lt;= 0 then 'PAID'
				when not regexp_like(r.tip_rec, 'TR0([1-6]0|12|21|22)') then 'INCORRECT BILL TYPE'
				when c.est_act not in (select 'ER315' from dual union select g.est_rec from cmsadmin.grupo_est g where g.co_grupo = 'GE114') then 'INCORRECT BILL STATUS'
				else 'OK'
			end) result
		from bills_to_pay b
			left join cmsadmin.recibos r on b.num_rec = r.num_rec
			left join cmsadmin.recibos c on b.num_rec = c.num_rec and b.cod_cta = c.cod_cta_pago
		where b.cod_cta &lt;&gt; 0
			and b.nis_rad = 0
			and b.num_rec &lt;&gt; 0 `,


	/*------------------------------------------------
	  *       ICN QUERY
	 ------------------------------------------------ */
	icn_next_code:
		"select cmsadmin.seq_code_aci.nextval codeaci from dual",

	icn_next_dematerialisation_code:
		"select cmsadmin.seq_code_dematerialisation.nextval code_dematerialisation from dual",

	select_groupes:
		"select distinct trim(groupe) groupe from cmsadmin.sdgc_groupes order by 1",

	icn_fulldata:
		``,

	icn_lightdata:
		``,

	icn_infos:
		`select /*+ parallel(6) */ distinct
			id_cobtemp,
			session_id,
			id_pago,
			nis_rad,
			bill_number,
			customer_name,
			billing_date,
			bill_type,
			voltage_type,
			method_of_payment,
			transaction_id,
			paid_amount,
			real_bill_amount,
			error_code,
			error_description,
			collected_amt_without_tax,
			collected_vat,
			collected_amt_with_tax,
			advance_payment,
			aci_number,
			c.cod_caja cash_box,
			upload_date,
			count(distinct id_cobtemp) over() Number_Of_Bills,
			sum(paid_amount) over() Total_Amount_Paid
		from cmsreport.tb_offline_collections c
        where aci_number = to_char(:ACI_NUMBER)`,

	icn_search_bill_status:
		`select /*+ parallel(6) */ distinct 
			cob_fuente_id facture, 
			est_cobtemp status, 
			imp_cob_bco montant , 
			f_cobro_orig date_paiement, 
			f_proc_cobro date_integration, 
			num_gest_cobro num_session
        from cobtemp 
		where cod_caja=5701473
		and cob_fuente_id = :BillNber
		and replace(substr(datos_pago, 46, 10),':') = :AciNber`,
	
	icn_search_bill_status_by_aci_number_offline_collections :
		`SELECT /*+ parallel(6) */ DISTINCT 
			COD_CAJA,
			ACI_NUMBER,
			SESSION_ID  
		FROM cmsreport.tb_offline_collections 
		WHERE  
		COD_CAJA ='5701473'
		AND ACI_NUMBER =:AciNber
		`,

}

