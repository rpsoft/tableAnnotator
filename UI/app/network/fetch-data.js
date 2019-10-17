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


  async removeOverrideTable(docid,page){
      var urlQueryRequest = urlBase+ "removeOverrideTable?docid="+encodeURIComponent(docid)+"&page="+page

      var r = await this.getGeneric( urlQueryRequest  )

      return r
  }

  async saveTableEdit(docid,page,content) {

    let result

    var options = {path : "/saveTableOverride"}

    try {
      result = await this.httpClient.sendPost( {docid: docid, page: page, table: content}, options )
    } catch(error) {
      console.error('Table Edit POST failed: ' + error)
    }

    return result
  }

  async saveAnnotation(docid,page,user,annotation,corrupted, tableType, corrupted_text) {

    var urlQueryRequest = urlBase+ "recordAnnotation?docid="+encodeURIComponent(docid)+"&page="+page+"&user="+user+"&annotation="+encodeURIComponent(JSON.stringify(annotation))+"&corrupted="+ (corrupted == undefined ? false : corrupted)+"&tableType="+tableType + "&corrupted_text=" + corrupted_text

    console.log(urlQueryRequest)

    var r = await this.getGeneric( urlQueryRequest  )

    return r

  }

  async getTable(docid,page) {

        var urlQueryRequest = urlBase+ "getTable?docid="+encodeURIComponent(docid)+"&page="+page

        var r = await this.getGeneric( urlQueryRequest  )

        return r
  }

  async getConceptRecommend() {

        var urlQueryRequest = urlBase+ "cuiRecommend"
// getConceptAssignment
        var r = await this.getGeneric( urlQueryRequest  )

        return JSON.parse(r)
  }
  //
  // async getMeshCategories() {
  //
  //   var urlQueryRequest = urlBase+ "mshcat"
  //
  //   var r = await this.getGeneric( urlQueryRequest  )
  //
  //       r = JSON.parse(r)
  //
  //   var allcats = []
  //
  //       r = r.reduce( (acc,item) => {acc[item.pmid] = item.mesh_broad_label; if ( allcats.indexOf(item.mesh_broad_label) < 0 ){allcats.push(item.mesh_broad_label)} return acc}, {})
  //
  //   return {catIndex: r, allcats: allcats}
  //
  // }


  async setTableMetadata(docid, page, concept, cuis, cuis_selected, qualifiers, qualifiers_selected, user, istitle) {
        // debugger
        var urlQueryRequest = urlBase+ "setMetadata?docid="+encodeURIComponent(docid)
                                                +"&page="+page
                                                +"&concept="+encodeURIComponent(concept)
                                                +"&cuis="+encodeURIComponent(cuis)
                                                +"&cuis_selected="+encodeURIComponent(cuis_selected)
                                                +"&qualifiers="+encodeURIComponent(qualifiers)
                                                +"&qualifiers_selected="+encodeURIComponent(qualifiers_selected)
                                                +"&user="+encodeURIComponent(user)
                                                +"&istitle="+encodeURIComponent(istitle || false)

        var r = await this.getGeneric( urlQueryRequest  )

        return r
  }

  async getTableMetadata(docid, page, user) {

        var urlQueryRequest = urlBase+ "getMetadata?docid="+encodeURIComponent(docid)+"&page="+page+"&user="+encodeURIComponent(user)

        var r = await this.getGeneric( urlQueryRequest  )

        return JSON.parse(r)
  }


  async clearTableMetadata(docid, page, user) {

        var urlQueryRequest = urlBase+ "clearMetadata?docid="+encodeURIComponent(docid)+"&page="+page+"&user="+encodeURIComponent(user)

        var r = await this.getGeneric( urlQueryRequest  )

        return r
  }





  async getAnnotationPreview(docid,page,user) {

        var urlQueryRequest = urlBase+ "annotationPreview?docid="+encodeURIComponent(docid)+"&page="+page+"&user="+user

        var r = await this.getGeneric( urlQueryRequest  )
        // debugger
        return JSON.parse(r)
  }

  async getAnnotationByID(docid,page,user) {

        var urlQueryRequest = urlBase+ "getAnnotationByID?docid="+encodeURIComponent(docid)+"&page="+page+"&user="+user

        var r = await this.getGeneric( urlQueryRequest  )

        return r
  }

  async getAllInfo(filter) {

        // filter = filter == "nofilter" ? null : filter

        var urlQueryRequest = urlBase+ "allInfo" +(filter ? "?filter=" + encodeURIComponent(filter) : "")

        var r = await this.getGeneric( urlQueryRequest  )

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

  async addCustomCUI(cui,description) {

    var urlQueryRequest = urlBase + "cuisIndexAdd?cui="+encodeURIComponent(cui)+"&preferred="+encodeURIComponent(description)+"&hasMSH=true"

    var r = await this.getGeneric( urlQueryRequest  )

    return r

  }


  async getClusterData() {

        var urlQueryRequest = urlBase + "getClusterData"
        var r = await this.getGeneric( urlQueryRequest  )

        return JSON.parse(r).rows
  }

  async setClusterData(cdata) {
        var urlQueryRequest = urlBase + "setClusterData?cn="+cdata.cn
                                      + "&rep_cuis="+cdata.rep_cuis.join(";")
                                      + "&excluded_cuis="+cdata.excluded_cuis.join(";")
                                      + "&status="+cdata.status

        console.log(urlQueryRequest)
        var r = await this.getGeneric( urlQueryRequest )

        return r
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


  async getAllClusterAnnotations() {

        var urlQueryRequest = urlBase+ "allClusterAnnotations"

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
