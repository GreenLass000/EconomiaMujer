from flask import Blueprint, request, jsonify, send_file
from report.generator import generar_pdf, generar_excel, construir_filas_reporte
from utils import get_session
from models import Person, Record
from datetime import datetime, timedelta

report_bp = Blueprint('report', __name__)


def get_date_range_or_error(start_date_str, end_date_str):
    if not start_date_str or not end_date_str:
        return None, jsonify({'error': 'Missing parameters'}), 400

    try:
        start_date = datetime.strptime(start_date_str, '%Y-%m-%d')
        end_date_inclusive = datetime.strptime(end_date_str, '%Y-%m-%d')
        end_date = end_date_inclusive + timedelta(days=1)
    except ValueError:
        return None, jsonify({'error': 'Invalid date format'}), 400

    return (start_date, end_date, end_date_inclusive), None, None


def get_records_for_person(session, person_id, start_date, end_date):
    return session.query(Record).filter(
        Record.person_id == person_id,
        Record.date >= start_date,
        Record.date < end_date
    ).order_by(Record.date.desc()).all()

@report_bp.route('/report', methods=['GET'])
def generar_reporte():
    person_id = request.args.get('person_id')
    start_date_str = request.args.get('start_date')
    end_date_str = request.args.get('end_date')

    if not person_id:
        return jsonify({'error': 'Missing parameters'}), 400

    date_range, error_response, status_code = get_date_range_or_error(start_date_str, end_date_str)
    if error_response:
        return error_response, status_code

    start_date, end_date, end_date_inclusive = date_range

    session = get_session()
    try:
        person = session.query(Person).filter_by(id=person_id).first()
        if not person:
            return jsonify({'error': 'Person not found'}), 404

        records = get_records_for_person(session, person_id, start_date, end_date)
        filas_reporte, saldo_total = construir_filas_reporte(records)

        # Lista de datos personales
        datos_lista = [
            f"Nombre: {person.firstName}",
            f"Apellido: {person.lastName}",
            f"Desde: {start_date.strftime('%d/%m/%Y')}",
            f"Hasta: {end_date_inclusive.strftime('%d/%m/%Y')}",
        ]

        nombre_completo = f"{person.firstName} {person.lastName}"
        pdf_buffer = generar_pdf(datos_lista, filas_reporte, saldo_total, nombre_completo)
        filename = f"{person.firstName}_{person.lastName}_reporte.pdf"
        return send_file(pdf_buffer, mimetype='application/pdf', as_attachment=True, download_name=filename)

    finally:
        session.close()


@report_bp.route('/report/excel', methods=['GET'])
def generar_reporte_excel():
    start_date_str = request.args.get('start_date')
    end_date_str = request.args.get('end_date')

    date_range, error_response, status_code = get_date_range_or_error(start_date_str, end_date_str)
    if error_response:
        return error_response, status_code

    start_date, end_date, end_date_inclusive = date_range

    session = get_session()
    try:
        persons = session.query(Person).filter_by(isactive=True).all()
        if not persons:
            return jsonify({'error': 'No active persons found'}), 404

        programa_mujer_persons = [
            person for person in persons
            if person.firstName.lower() == 'programa' and person.lastName.lower() == 'mujer'
        ]
        other_persons = [
            person for person in persons
            if not (person.firstName.lower() == 'programa' and person.lastName.lower() == 'mujer')
        ]
        ordered_persons = programa_mujer_persons + sorted(other_persons, key=lambda person: (person.lastName.lower(), person.firstName.lower()))

        reportes_por_persona = []
        for person in ordered_persons:
            records = get_records_for_person(session, person.id, start_date, end_date)
            filas_reporte, saldo_total = construir_filas_reporte(records)
            reportes_por_persona.append({
                'name': f'{person.firstName} {person.lastName}',
                'rows': filas_reporte,
                'saldo_total': saldo_total,
            })

        excel_buffer = generar_excel(reportes_por_persona, start_date, end_date_inclusive)
        filename = f"reporte_{start_date.strftime('%Y%m%d')}_{end_date_inclusive.strftime('%Y%m%d')}.xlsx"
        return send_file(
            excel_buffer,
            mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            as_attachment=True,
            download_name=filename
        )
    finally:
        session.close()
