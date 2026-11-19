# -*- coding: utf-8 -*-
"""
Script maestro para generar los archivos XML de Enterprise Architect (XMI 1.1)
con soporte de Lienzo Principal (Canvas) para diagramas de secuencia y clases.
Incluye escape estricto de caracteres XML (&, <, >, ", ').
"""

import os
from xml.sax.saxutils import escape

def xml_escape(val):
    if not isinstance(val, str):
        val = str(val)
    return escape(val, entities={'"': "&quot;", "'": "&apos;"})

def get_xmi_header(author="Ybanera Herrera Edberto"):
    return f"""<?xml version="1.0" encoding="utf-8"?>
<XMI xmi.version="1.1" xmlns:UML="omg.org/UML1.3" timestamp="2026-11-19 04:00:00">
	<XMI.header>
		<XMI.documentation>
			<XMI.exporter>Enterprise Architect</XMI.exporter>
			<XMI.exporterVersion>2.5</XMI.exporterVersion>
		</XMI.documentation>
	</XMI.header>
"""

def generate_sequence_diagram(file_path, package_id, package_name, diag_id, diag_name, lifelines, messages, author="Ybanera Herrera Edberto"):
    collab_id = f"COL_{package_id}"
    inter_id = f"INT_{package_id}"
    
    xml = get_xmi_header(author)
    xml += f"""	<XMI.content>
		<UML:Model name="EA Model" xmi.id="MX_EA_Model">
			<UML:Namespace.ownedElement>
				<UML:Package name="{xml_escape(package_name)}" xmi.id="{package_id}" isRoot="false" isLeaf="false" isAbstract="false" visibility="public">
					<UML:ModelElement.taggedValue>
						<UML:TaggedValue tag="ea_package_id" value="{package_id}"/>
					</UML:ModelElement.taggedValue>
					<UML:Namespace.ownedElement>
						<UML:Collaboration xmi.id="{collab_id}" name="{xml_escape(package_name)} Colaboracion">
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
					</UML:Namespace.ownedElement>
				</UML:Package>
			</UML:Namespace.ownedElement>
		</UML:Model>
	</XMI.content>
	<XMI.difference/>
	<XMI.extensions xmi.extender="Enterprise Architect 2.5">
		<EAModel.diagram>
			<Diagram name="{xml_escape(diag_name)}" xmi.id="{diag_id}" diagram_type="Sequence" toolflags="NAVBAR=1;" version="1.0">
				<project author="{xml_escape(author)}" version="1.0" created="2026-11-19 04:00:00" modified="2026-11-19 04:00:00"/>
				<properties name="{xml_escape(diag_name)}" type="Sequence"/>
				<extended_properties package="{package_id}"/>
				<elements>
"""
    for idx, (lid, lname, ltype, x1, x2) in enumerate(lifelines, start=1):
        xml += f"""					<DiagramElement geometry="Left={x1};Top=50;Right={x2};Bottom=780;" subject="{lid}" seqno="{idx}" style="DUID=SEQ_{idx:02d};"/>\n"""

    xml += f"""				</elements>
			</Diagram>
		</EAModel.diagram>
		<EAModel.element>
"""
    for lid, lname, ltype, x1, x2 in lifelines:
        xml += f"""			<Element name="{xml_escape(lname)}" xmi.idref="{lid}" ea_type="Sequence" package="{package_id}"/>\n"""

    xml += """		</EAModel.element>
	</XMI.extensions>
</XMI>
"""
    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(xml)
    print(f"[OK] Diagrama de Secuencia generado: {file_path}")

def generate_class_diagram(file_path, package_id, package_name, diag_id, diag_name, classes, associations=None, author="Ybanera Herrera Edberto"):
    if associations is None:
        associations = []
        
    xml = get_xmi_header(author)
    xml += f"""	<XMI.content>
		<UML:Model name="EA Model" xmi.id="MX_EA_Model">
			<UML:Namespace.ownedElement>
				<UML:Package name="{xml_escape(package_name)}" xmi.id="{package_id}" isRoot="false" isLeaf="false" isAbstract="false" visibility="public">
					<UML:ModelElement.taggedValue>
						<UML:TaggedValue tag="ea_package_id" value="{package_id}"/>
					</UML:ModelElement.taggedValue>
					<UML:Namespace.ownedElement>
"""
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

    xml += f"""					</UML:Namespace.ownedElement>
				</UML:Package>
			</UML:Namespace.ownedElement>
		</UML:Model>
	</XMI.content>
	<XMI.difference/>
	<XMI.extensions xmi.extender="Enterprise Architect 2.5">
		<EAModel.diagram>
			<Diagram name="{xml_escape(diag_name)}" xmi.id="{diag_id}" diagram_type="Logical" toolflags="NAVBAR=1;" version="1.0">
				<project author="{xml_escape(author)}" version="1.0" created="2026-11-19 04:00:00" modified="2026-11-19 04:00:00"/>
				<properties name="{xml_escape(diag_name)}" type="Logical"/>
				<extended_properties package="{package_id}"/>
				<elements>
"""
    for idx, cls in enumerate(classes, start=1):
        l, t, r, b = cls['geometry']
        xml += f"""					<DiagramElement geometry="Left={l};Top={t};Right={r};Bottom={b};" subject="{cls['id']}" seqno="{idx}" style="DUID=CLS_{idx:02d};"/>\n"""

    xml += f"""				</elements>
			</Diagram>
		</EAModel.diagram>
		<EAModel.element>
"""
    for cls in classes:
        ea_t = "Enumeration" if cls.get('stereotype') == 'enumeration' else "Class"
        xml += f"""			<Element name="{xml_escape(cls['name'])}" xmi.idref="{cls['id']}" ea_type="{ea_t}" package="{package_id}"/>\n"""

    xml += """		</EAModel.element>
	</XMI.extensions>
</XMI>
"""
    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(xml)
    print(f"[OK] Diagrama de Clases generado: {file_path}")
