var fs = require('fs');

module.exports = function (attachmentFName) {
  var res = {
    id: '6c84fb90-12c4-11e1-840d-7b25c5ee775a',
    created: '2016-09-14T17:45:53.164Z',
    from: {
      name: 'Альфа-банк московский филиал',
      id: '02a2ce90-1432-11e1-8558-0b488e4fc115'
    },
    fields: [{
      name: 'Тип инцидента',
      value: 'Несанкционированные действия'
    }, {
      name: 'Уровень инцидента',
      value: 'Критичный'
    }, {
      name: 'Дата выявления инцидента',
      value: '15.09.2016'
    }, {
      name: 'Время выявления инцидента',
      value: '17:45'
    }, {
      name: 'Уровень ущерба (количественная оценка)',
      value: 10000000
    }, {
      name: 'Регион возникновения',
      value: 'Алтайский край'
    }],
    recipients: [{
      name: 'Альфа-банк сибирский филиал',
      id: '110ec58a-a0f2-4ac4-8393-c866d813b8d1'
    }, {
      name: 'Альфа-банк уральский филиал',
      id: '710b962e-041c-11e1-9234-0123456789ab'
    }],
    attachments: [{
      filename: 'Снимок экрана 2016-09-14 в 20.33.07.png',
      filesize: 1321056,
      data: fs.readFileSync(attachmentFName)
    }]
  };

  fs.writeFileSync(attachmentFName + '.json', JSON.stringify(res));

  return res;
};
