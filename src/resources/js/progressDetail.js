window.addEventListener('message', event => {

    // The JSON data our extension sent
    const message = event.data; 

    var template = $.trim($('#template-log').html());
    var container;

    // 상태값에 따라 어떤 목록에 로그 추가할지 결정
    switch (message.status) {
        case 'Build':
            container = $('#buildReadMore');
            break;
        case 'Analyze':
            container = $('#analyzeReadMore');
            break;
        case 'Patch':
            container = $('#patchReadMore');
            break;
        case 'Validate':
            container = $('#validateReadMore');
            break;
    }

    // template 으로 html 추가하기
    var newLog = template;
    for (var i in message) {
        if(i == "status") continue;

        var pattern = new RegExp('\\{\\{' + i + '\\}\\}', 'g')
        newLog = newLog.replace(pattern, message[i])
    }
    container.append(newLog);
    
});