import HttpClient from './http-client';
import { URL_BASE } from '../links'


const urlBase = URL_BASE + 'api/'

export default class fetchData {
  constructor() {
    this.httpClient = new HttpClient()
  }

  async getGeneric(path) {
    let result

    try {
      result = await this.httpClient.send('', { path })
    } catch(error) {
      console.error('fetching template list error > ' + error)
    }

    return result
  }

  async saveAnnotation(docid,page,user,annotation,corrupted, tableType, corrupted_text) {

    var urlQueryRequest = urlBase+ "recordAnnotation?docid="+encodeURIComponent(docid)+"&page="+page+"&user="+user+"&annotation="+encodeURIComponent(JSON.stringify(annotation))+"&corrupted="+ (corrupted == undefined ? false : corrupted)+"&tableType="+tableType + "&corrupted_text=" + corrupted_text

    console.log(urlQueryRequest)

    var r = await this.getGeneric( urlQueryRequest  )
    // debugger
    return r

  }

  async getTable(docid,page) {

        var urlQueryRequest = urlBase+ "getTable?docid="+encodeURIComponent(docid)+"&page="+page

        var r = await this.getGeneric( urlQueryRequest  )
        // debugger
        return r

  }

  async getAnnotationPreview(docid,page,user) {

        var urlQueryRequest = urlBase+ "annotationPreview?docid="+encodeURIComponent(docid)+"&page="+page+"&user="+user

        var r = await this.getGeneric( urlQueryRequest  )
        // debugger
        return r

  }

  async getAnnotationByID(docid,page,user) {

        var urlQueryRequest = urlBase+ "getAnnotationByID?docid="+encodeURIComponent(docid)+"&page="+page+"&user="+user

        var r = await this.getGeneric( urlQueryRequest  )
        // debugger
        return r

  }

  async getAllInfo() {

        var urlQueryRequest = urlBase+ "allMetaData"

        var r = await this.getGeneric( urlQueryRequest  )
        // debugger
        return r

  }

  async getCUISIndex() {

        var urlQueryRequest = urlBase + "cuisIndex"

        var r = await this.getGeneric( urlQueryRequest  )

        return JSON.parse(r)
  }

  async getCUIModifiers() {

        var urlQueryRequest = urlBase + "getCUIMods"

        var r = await this.getGeneric( urlQueryRequest  )

        return JSON.parse(r)
  }

  async setCUIModifiers(cuis) {

        var urlQueryRequest = urlBase + "setCUIMods?cuis="+encodeURIComponent(cuis)

        var r = await this.getGeneric( urlQueryRequest  )

        return JSON.parse(r)
  }




  async getAllClusters() {

        var urlQueryRequest = urlBase+ "allClusters"

        var r = await this.getGeneric( urlQueryRequest  )

        return JSON.parse(r).rows

  }

  async saveClusterAnnotation(cn,concept,cuis,isdefault,cn_override) {

    var urlQueryRequest = urlBase+ "recordClusterAnnotation?cn="+cn+"&concept="+encodeURIComponent(concept)+"&cuis="+encodeURIComponent(cuis)+"&isdefault="+encodeURIComponent(isdefault)+"&cn_override="+cn_override //;recordClusterAnnotation?docid="+encodeURIComponent(docid)+"&page="+page+"&user="+user+"&annotation="+encodeURIComponent(JSON.stringify(annotation))+"&corrupted="+ (corrupted == undefined ? false : corrupted)+"&tableType="+tableType + "&corrupted_text=" + corrupted_text

    console.log(urlQueryRequest)

    var r = await this.getGeneric( urlQueryRequest  )

    return r

  }

  async getAllAnnotations() {

        var urlQueryRequest = urlBase+ "getAnnotations"

        var r = await this.getGeneric( urlQueryRequest  )

        return r

  }

  async getAllAvailableTables() {

        var urlQueryRequest = urlBase + "getAvailableTables"

        var r = await this.getGeneric( urlQueryRequest  )

        return r

  }

  async getMMatch(phrase) {

    var urlQueryRequest = urlBase + "getMMatch?phrase="+encodeURIComponent(phrase)

    var r = await this.getGeneric( urlQueryRequest  )


    try{
      r = JSON.parse(r)
      r = r.AllDocuments[0].Document.Utterances.map(
                      utterances => utterances.Phrases.map(
                        phrases => phrases.Mappings.map(
                          mappings => mappings.MappingCandidates.map(
                            candidate => ({
                                      CUI:candidate.CandidateCUI,
                                      matchedText: candidate.CandidateMatched,
                                      preferred: candidate.CandidatePreferred,
                                      hasMSH: candidate.Sources.indexOf("MSH") > -1
                                   })
                                 )
                               )
                             )
                           )[0][0].flat()

      // This removes duplicate cuis
      r = r.reduce( (acc,el) => {if ( acc.cuis.indexOf(el.CUI) < 0 ){acc.cuis.push(el.CUI); acc.data.push(el)}; return acc }, {cuis: [], data: []} ).data
    } catch (e){

      return []
    }

    return r

  }
}
