1. Sem conflito de horário. Um profissional não pode ter duas consultas no mesmo horário. Uma nova consulta é recusada se o intervalo dela se sobrepõe ao de outra consulta já agendada para o mesmo profissional.
   - Casos de teste: sobreposição total, sobreposição parcial, consultas encostadas (uma termina 10:00 e a outra começa 10:00, o que deve ser permitido) e mesmo horário com profissionais diferentes (também permitido).

2. Agendamento só no futuro e em horário comercial. A consulta precisa ser marcada com pelo menos X horas de antecedência (por exemplo, 2h) e cair dentro do expediente (por exemplo, de segunda a sexta, das 8h às 18h, com duração fixa de 30 min).
   - Casos de teste: data no passado, antecedência menor que a mínima, sábado ou domingo, consulta que começa às 17:45 e terminaria depois das 18h.

3. Cancelamento com prazo mínimo. O paciente só pode cancelar até 24h antes da consulta. Depois disso, o cancelamento é recusado ou a consulta fica marcada como "falta". Consultas já canceladas ou já realizadas não podem ser canceladas de novo.
   - Casos de teste: cancelar com 25h de antecedência (permitido), com 23h (recusado), consulta já cancelada (recusado).
   - Dica: injete um "relógio" (Clock/DateProvider) em vez de usar new Date() direto. Assim os testes conseguem controlar o "agora".

4. Limite de consultas por paciente. Um paciente pode ter no máximo N consultas futuras em aberto (por exemplo, 2) e não pode ter duas consultas no mesmo dia com o mesmo profissional.
   - Casos de teste: paciente com 2 consultas tentando marcar a 3ª (recusado), a mesma situação depois de cancelar uma (permitido), segunda consulta no mesmo dia com o mesmo profissional (recusado) e com outro profissional (permitido).
