# -*- coding: utf-8 -*-
"""
Genera el archivo maestro unificado de Enterprise Architect:
docs/xml/proyecto_completo_enterprise_architect.xml
Contiene la jerarquia completa del proyecto: Sprints 1, 2, 3,
los 7 diagramas de secuencia y los 4 diagramas de clases, con sus lienzos principales (canvas).
"""

import os
import xml.etree.ElementTree as ET
from generate_all import xml_escape, get_xmi_header
from build_all_diagrams import (
    lifelines_hu01, messages_hu01, classes_sp1, assoc_sp1,
    lifelines_hu02, messages_hu02,
    lifelines_hu03, messages_hu03, classes_sp2, assoc_sp2,
    lifelines_hu04, messages_hu04,
    lifelines_hu05, messages_hu05, classes_sp3, assoc_sp3,
    lifelines_hu06, messages_hu06,
    lifelines_hu07, messages_hu07,
    classes_global, assoc_global,
    AUTHOR
)

OUTPUT_FILE = r"c:\EDBERTO\ULTIMO\SW2\SW2-PF-GESTOR-NOTAvF-26-2\docs\xml\proyecto_completo_enterprise_architect.xml"

def build_classes_xml(classes, associations):
    xml = ""
    for cls in classes:
        st_tag = f"""<UML:ModelElement.stereotype><UML:Stereotype name="{xml_escape(cls.get('stereotype', ''))}"/></UML:ModelElement.stereotype>""" if cls.get('stereotype') else ""
        xml += f"""						<UML:Class name="{xml_escape(cls['name'])}" xmi.id="{cls['id']}" visibility="public" isRoot="false" isLeaf="false" isAbstract="false">
							{st_tag}
							<UML:Classifier.feature>
"""
        for idx_a, (aname, atype, avis) in enumerate(cls.get('attributes', []), start=1):
            xml += f"""								<UML:Attribute name="{xml_escape(aname)} : {xml_escape(atype)}" xmi.id="ATTR_{cls['id']}_{idx_a}" visibility="{avis}">
									<UML:ModelElement.taggedValue>
										<UML:TaggedValue tag="type" value="{xml_escape(atype)}"/>
									</UML:ModelElement.taggedValue>
								</UML:Attribute>
"""
        for idx_o, (oname, oret, ovis) in enumerate(cls.get('operations', []), start=1):
            ret_str = f" : {xml_escape(oret)}" if oret else ""
            xml += f"""								<UML:Operation name="{xml_escape(oname)}{ret_str}" xmi.id="OPER_{cls['id']}_{idx_o}" visibility="{ovis}"/>
"""
        xml += f"""							</UML:Classifier.feature>
						</UML:Class>
"""
    for assoc in associations:
        xml += f"""						<UML:Association name="{xml_escape(assoc.get('name', ''))}" xmi.id="{assoc['id']}">
							<UML:Association.connection>
								<UML:AssociationEnd name="{xml_escape(assoc.get('source_name', ''))}" type="{assoc['source_id']}" multiplicity="{xml_escape(assoc.get('source_multiplicity', '1'))}" isNavigable="true"/>
								<UML:AssociationEnd name="{xml_escape(assoc.get('target_name', ''))}" type="{assoc['target_id']}" multiplicity="{xml_escape(assoc.get('target_multiplicity', '1'))}" isNavigable="true"/>
							</UML:Association.connection>
						</UML:Association>
"""
    return xml

def build_seq_collab_xml(collab_id, collab_name, inter_id, diag_name, lifelines, messages):
    xml = f"""						<UML:Collaboration xmi.id="{collab_id}" name="{xml_escape(collab_name)}">
							<UML:Namespace.ownedElement>
"""
    for lid, lname, ltype, x1, x2 in lifelines:
        xml += f"""								<UML:ClassifierRole name="{xml_escape(lname)}" xmi.id="{lid}" visibility="public">
									<UML:ModelElement.taggedValue>
										<UML:TaggedValue tag="ea_stype" value="Sequence"/>
										<UML:TaggedValue tag="is_active" value="false"/>
										<UML:TaggedValue tag="classifier_type" value="{xml_escape(ltype)}"/>
									</UML:ModelElement.taggedValue>
								</UML:ClassifierRole>
"""
    xml += f"""							</UML:Namespace.ownedElement>
							<UML:Collaboration.interaction>
								<UML:Interaction xmi.id="{inter_id}" name="{xml_escape(diag_name)}">
									<UML:Interaction.message>
"""
    for mid, mname, s_id, r_id, s_num in messages:
        xml += f"""										<UML:Message name="{xml_escape(mname)}" xmi.id="{mid}" sender="{s_id}" receiver="{r_id}">
											<UML:Message.action>
												<UML:CallAction xmi.id="ACT_{mid}"/>
											</UML:Message.action>
											<UML:ModelElement.taggedValue>
												<UML:TaggedValue tag="ea_type" value="Sequence"/>
												<UML:TaggedValue tag="direction" value="Source -&gt; Destination"/>
												<UML:TaggedValue tag="sequence_number" value="{s_num}"/>
												<UML:TaggedValue tag="line_color" value="-1"/>
												<UML:TaggedValue tag="ptx" value="0"/>
												<UML:TaggedValue tag="pty" value="0"/>
											</UML:ModelElement.taggedValue>
										</UML:Message>
"""
    xml += f"""									</UML:Interaction.message>
								</UML:Interaction>
							</UML:Collaboration.interaction>
						</UML:Collaboration>
"""
    return xml

def build_diagram_xml(diag_id, diag_name, diag_type, package_id, elements_geo):
    """
    elements_geo: [(subject_id, Left, Top, Right, Bottom)]
    """
    xml = f"""			<Diagram name="{xml_escape(diag_name)}" xmi.id="{diag_id}" diagram_type="{diag_type}" toolflags="NAVBAR=1;" version="1.0">
				<project author="{xml_escape(AUTHOR)}" version="1.0" created="2026-11-19 04:00:00" modified="2026-11-19 04:00:00"/>
				<properties name="{xml_escape(diag_name)}" type="{diag_type}"/>
				<extended_properties package="{package_id}"/>
				<elements>
"""
    for idx, (sub_id, l, t, r, b) in enumerate(elements_geo, start=1):
        xml += f"""					<DiagramElement geometry="Left={l};Top={t};Right={r};Bottom={b};" subject="{sub_id}" seqno="{idx}" style="DUID=ELEM_{idx:02d};"/>\n"""
    xml += """				</elements>
			</Diagram>
"""
    return xml

def main():
    xml = get_xmi_header(AUTHOR)
    xml += """	<XMI.content>
		<UML:Model name="EA Model" xmi.id="MX_EA_Model">
			<UML:Namespace.ownedElement>
				<UML:Package name="Gestor de Notas con IA" xmi.id="EAPK_ROOT" isRoot="true" isLeaf="false" isAbstract="false" visibility="public">
					<UML:ModelElement.taggedValue>
						<UML:TaggedValue tag="ea_package_id" value="EAPK_ROOT"/>
					</UML:ModelElement.taggedValue>
					<UML:Namespace.ownedElement>
"""
    # ------------------ Sprint 1 Package ------------------
    xml += """						<UML:Package name="Sprint 1 - Base Academica y Cuentas" xmi.id="EAPK_M_SP1" isRoot="false" isLeaf="false" isAbstract="false" visibility="public">
							<UML:ModelElement.taggedValue>
								<UML:TaggedValue tag="ea_package_id" value="EAPK_M_SP1"/>
							</UML:ModelElement.taggedValue>
							<UML:Namespace.ownedElement>
"""
    xml += build_classes_xml(classes_sp1, assoc_sp1)
    xml += build_seq_collab_xml("COL_M_SP1_HU01", "HU-01 Colaboracion", "INT_M_SP1_HU01", "HU-01 Secuencia", lifelines_hu01, messages_hu01)
    xml += build_seq_collab_xml("COL_M_SP1_HU02", "HU-02 Colaboracion", "INT_M_SP1_HU02", "HU-02 Secuencia", lifelines_hu02, messages_hu02)
    xml += """							</UML:Namespace.ownedElement>
						</UML:Package>
"""

    # ------------------ Sprint 2 Package ------------------
    xml += """						<UML:Package name="Sprint 2 - Constructor de Examenes y Movil" xmi.id="EAPK_M_SP2" isRoot="false" isLeaf="false" isAbstract="false" visibility="public">
							<UML:ModelElement.taggedValue>
								<UML:TaggedValue tag="ea_package_id" value="EAPK_M_SP2"/>
							</UML:ModelElement.taggedValue>
							<UML:Namespace.ownedElement>
"""
    xml += build_classes_xml(classes_sp2, assoc_sp2)
    xml += build_seq_collab_xml("COL_M_SP2_HU03", "HU-03 Colaboracion", "INT_M_SP2_HU03", "HU-03 Secuencia", lifelines_hu03, messages_hu03)
    xml += build_seq_collab_xml("COL_M_SP2_HU04", "HU-04 Colaboracion", "INT_M_SP2_HU04", "HU-04 Secuencia", lifelines_hu04, messages_hu04)
    xml += """							</UML:Namespace.ownedElement>
						</UML:Package>
"""

    # ------------------ Sprint 3 Package ------------------
    xml += """						<UML:Package name="Sprint 3 - Calificacion IA y Portal Estudiantil" xmi.id="EAPK_M_SP3" isRoot="false" isLeaf="false" isAbstract="false" visibility="public">
							<UML:ModelElement.taggedValue>
								<UML:TaggedValue tag="ea_package_id" value="EAPK_M_SP3"/>
							</UML:ModelElement.taggedValue>
							<UML:Namespace.ownedElement>
"""
    xml += build_classes_xml(classes_sp3, assoc_sp3)
    xml += build_seq_collab_xml("COL_M_SP3_HU05", "HU-05 Colaboracion", "INT_M_SP3_HU05", "HU-05 Secuencia", lifelines_hu05, messages_hu05)
    xml += build_seq_collab_xml("COL_M_SP3_HU06", "HU-06 Colaboracion", "INT_M_SP3_HU06", "HU-06 Secuencia", lifelines_hu06, messages_hu06)
    xml += build_seq_collab_xml("COL_M_SP3_HU07", "HU-07 Colaboracion", "INT_M_SP3_HU07", "HU-07 Secuencia", lifelines_hu07, messages_hu07)
    xml += """							</UML:Namespace.ownedElement>
						</UML:Package>
"""

    # ------------------ Global Architecture Package ------------------
    xml += """						<UML:Package name="Diagrama de Clases Integral del Sistema" xmi.id="EAPK_M_GLOBAL" isRoot="false" isLeaf="false" isAbstract="false" visibility="public">
							<UML:ModelElement.taggedValue>
								<UML:TaggedValue tag="ea_package_id" value="EAPK_M_GLOBAL"/>
							</UML:ModelElement.taggedValue>
							<UML:Namespace.ownedElement>
"""
    xml += build_classes_xml(classes_global, assoc_global)
    xml += """							</UML:Namespace.ownedElement>
						</UML:Package>
					</UML:Namespace.ownedElement>
				</UML:Package>
			</UML:Namespace.ownedElement>
		</UML:Model>
	</XMI.content>
	<XMI.difference/>
	<XMI.extensions xmi.extender="Enterprise Architect 2.5">
		<EAModel.diagram>
"""
    # ---------------- Diagram Canvases (Lienzo Principal) ----------------
    # 1. HU-01
    geo_hu01 = [(lid, x1, 50, x2, 780) for lid, lname, ltype, x1, x2 in lifelines_hu01]
    xml += build_diagram_xml("EA_DIAG_M_HU01", "HU-01 Secuencia - Administracion Docentes y Padron", "Sequence", "EAPK_M_SP1", geo_hu01)

    # 2. HU-02
    geo_hu02 = [(lid, x1, 50, x2, 780) for lid, lname, ltype, x1, x2 in lifelines_hu02]
    xml += build_diagram_xml("EA_DIAG_M_HU02", "HU-02 Secuencia - Gestion Materias Paralelos y Ficha", "Sequence", "EAPK_M_SP1", geo_hu02)

    # 3. Sprint 1 Class
    geo_cl_sp1 = [(cls['id'], cls['geometry'][0], cls['geometry'][1], cls['geometry'][2], cls['geometry'][3]) for cls in classes_sp1]
    xml += build_diagram_xml("EA_DIAG_M_CL_SP1", "Sprint 1 - Diagrama de Clases Academico y Cuentas", "Logical", "EAPK_M_SP1", geo_cl_sp1)

    # 4. HU-03
    geo_hu03 = [(lid, x1, 50, x2, 780) for lid, lname, ltype, x1, x2 in lifelines_hu03]
    xml += build_diagram_xml("EA_DIAG_M_HU03", "HU-03 Secuencia - Diseno Modular de Examenes y PDF", "Sequence", "EAPK_M_SP2", geo_hu03)

    # 5. HU-04
    geo_hu04 = [(lid, x1, 50, x2, 780) for lid, lname, ltype, x1, x2 in lifelines_hu04]
    xml += build_diagram_xml("EA_DIAG_M_HU04", "HU-04 Secuencia - Escaneo Movil Multipagina Flutter", "Sequence", "EAPK_M_SP2", geo_hu04)

    # 6. Sprint 2 Class
    geo_cl_sp2 = [(cls['id'], cls['geometry'][0], cls['geometry'][1], cls['geometry'][2], cls['geometry'][3]) for cls in classes_sp2]
    xml += build_diagram_xml("EA_DIAG_M_CL_SP2", "Sprint 2 - Diagrama de Clases Constructor y Movil", "Logical", "EAPK_M_SP2", geo_cl_sp2)

    # 7. HU-05
    geo_hu05 = [(lid, x1, 50, x2, 780) for lid, lname, ltype, x1, x2 in lifelines_hu05]
    xml += build_diagram_xml("EA_DIAG_M_HU05", "HU-05 Secuencia - Calificacion IA y Auditoria Docente", "Sequence", "EAPK_M_SP3", geo_hu05)

    # 8. HU-06
    geo_hu06 = [(lid, x1, 50, x2, 780) for lid, lname, ltype, x1, x2 in lifelines_hu06]
    xml += build_diagram_xml("EA_DIAG_M_HU06", "HU-06 Secuencia - Publicacion y Consulta Estudiante", "Sequence", "EAPK_M_SP3", geo_hu06)

    # 9. HU-07
    geo_hu07 = [(lid, x1, 50, x2, 780) for lid, lname, ltype, x1, x2 in lifelines_hu07]
    xml += build_diagram_xml("EA_DIAG_M_HU07", "HU-07 Secuencia - Acceso Rapido Demo 1-Clic", "Sequence", "EAPK_M_SP3", geo_hu07)

    # 10. Sprint 3 Class
    geo_cl_sp3 = [(cls['id'], cls['geometry'][0], cls['geometry'][1], cls['geometry'][2], cls['geometry'][3]) for cls in classes_sp3]
    xml += build_diagram_xml("EA_DIAG_M_CL_SP3", "Sprint 3 - Diagrama de Clases Evaluaciones e IA", "Logical", "EAPK_M_SP3", geo_cl_sp3)

    # 11. Global System Class Diagram
    geo_cl_global = [(cls['id'], cls['geometry'][0], cls['geometry'][1], cls['geometry'][2], cls['geometry'][3]) for cls in classes_global]
    xml += build_diagram_xml("EA_DIAG_M_CL_GLOBAL", "Diagrama de Clases Completo del Sistema Gestor de Notas", "Logical", "EAPK_M_GLOBAL", geo_cl_global)

    xml += """		</EAModel.diagram>
		<EAModel.element>
"""
    # Lifelines in EAModel.element
    all_seqs = [
        ("EAPK_M_SP1", lifelines_hu01),
        ("EAPK_M_SP1", lifelines_hu02),
        ("EAPK_M_SP2", lifelines_hu03),
        ("EAPK_M_SP2", lifelines_hu04),
        ("EAPK_M_SP3", lifelines_hu05),
        ("EAPK_M_SP3", lifelines_hu06),
        ("EAPK_M_SP3", lifelines_hu07),
    ]
    for pkg_id, llist in all_seqs:
        for lid, lname, ltype, x1, x2 in llist:
            xml += f"""			<Element name="{xml_escape(lname)}" xmi.idref="{lid}" ea_type="Sequence" package="{pkg_id}"/>\n"""

    # Classes in EAModel.element
    all_class_pkgs = [
        ("EAPK_M_SP1", classes_sp1),
        ("EAPK_M_SP2", classes_sp2),
        ("EAPK_M_SP3", classes_sp3),
        ("EAPK_M_GLOBAL", classes_global),
    ]
    for pkg_id, clist in all_class_pkgs:
        for cls in clist:
            ea_t = "Enumeration" if cls.get('stereotype') == 'enumeration' else "Class"
            xml += f"""			<Element name="{xml_escape(cls['name'])}" xmi.idref="{cls['id']}" ea_type="{ea_t}" package="{pkg_id}"/>\n"""

    xml += """		</EAModel.element>
	</XMI.extensions>
</XMI>
"""
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        f.write(xml)
    print(f"[OK] Proyecto Maestro Unificado generado: {OUTPUT_FILE}")

if __name__ == "__main__":
    main()
