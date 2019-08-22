var ONESHOT = function(url) {
	this.url = url;
};
ONESHOT.prototype.toSOAP = function() {
	var xml='<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ones="http://oneshot.ws.ure.allfinanz.com/">';
	xml += '<soapenv:Header/>';
	xml += '<soapenv:Body>';
	xml += '<ones:CreateCaseRequestBody>';
	xml += '<caseId></caseId>';
	xml += '<caseXML><![CDATA[';
	xml +=document.getElementById("OutputArea").value;
	xml += ']]></caseXML>';
	xml += ' <locale>'+ureCase.locale+'</locale>';
	xml += '</ones:CreateCaseRequestBody>';
	xml += '</soapenv:Body>';
	xml += '</soapenv:Envelope>';
	
	var xhr = createCORSRequest('POST', this.url+"/services/ONESHOT");
    xhr.setRequestHeader('Content-Type', 'text/xml');
	xhr.onload = function() {
		var txt = xhr.responseText;
		
		if (window.DOMParser)
		{
			parser=new DOMParser();
			xmlDoc=parser.parseFromString(txt,"application/xml");
		}
		else // Internet Explorer
		{
			xmlDoc=new ActiveXObject("Microsoft.XMLDOM");
			xmlDoc.async=false;
			xmlDoc.loadXML(txt);
		}
		var codes=xmlDoc.getElementsByTagName('caseXML')

		var out = codes[0].textContent;
		if (out == null || out == "") {
			out = codes[0].nextSibling.textContent;
		}
		document.getElementById('debug').innerText = (out);
		document.getElementById('debug').style.display="block";
	};

    xhr.onerror = function() {
		document.getElementById('debug').innerText = xhr.responseText;
		document.getElementById('debug').style.display="block";
		alert('Woops, there was an error making the request.');
	};
	xhr.send(xml);

};

var RETRIEVELIST = function(url, rulebookname, rulebookversion, locale) {
	this.url = url;
	this.rulebookname=rulebookname;
	this.rulebookversion=rulebookversion;
	this.locale = locale;
};
RETRIEVELIST.prototype.toSOAP = function(listName) {
	var xml ='<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ret="http://retrievelist.ws.ure.allfinanz.com/">';
	xml +='<soapenv:Header/>';
	xml +='<soapenv:Body>';
    xml +='<ret:RetrieveListRequestBody>';
	xml +='<retrieveLists>';
	xml +='<listNames>';
	xml +='<listName>'+listName+'</listName>';
	xml +='</listNames>';
	xml +='<rulebook>'+this.rulebookname+'</rulebook>';
	xml +='<version>'+this.rulebookversion+'</version>';
	xml +='<locales>';
	xml += this.locale;
	xml +='</locales>';
	xml +='</retrieveLists>';
    xml +='</ret:RetrieveListRequestBody>';
	xml +='</soapenv:Body>';
	xml +='</soapenv:Envelope>';

	//https://developer.chrome.com/extensions/xhr
	var xhr = createCORSRequest('POST', this.url+"/services/RETRIEVELIST");
    xhr.setRequestHeader('Content-Type', 'text/xml');
	xhr.onload = function() {
    var txt = xhr.responseText;
	document.getElementById('debug').innerHTML = formatXml(txt);
	document.getElementById('debug').style.display="block";
};

  xhr.onerror = function() {
    alert('Woops, there was an error making the request.');
  };
	xhr.send(xml);

};